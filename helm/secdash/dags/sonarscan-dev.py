import datetime

from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.cncf.kubernetes.operators.kubernetes_pod import (
    KubernetesPodOperator,
)
from kubernetes.client import V1VolumeMount, V1Volume, V1ResourceRequirements, V1PersistentVolumeClaimVolumeSource
from projects import fetch_sonarscan_projects, load_sonarscan_results

YESTERDAY = datetime.datetime.now() - datetime.timedelta(days=1)
CONCURRENCY = 1
MONGO_CONN_ID = 'pltsvc-dev'

with DAG(
    dag_id="sonarscan_dev",
    schedule_interval=datetime.timedelta(days=1),
    start_date=YESTERDAY,
    concurrency=CONCURRENCY,
) as dag:

    # Step 1. Identify and gather information for all currently active projects, including their host details.
    t1 = PythonOperator(
        task_id='fetch-sonarscan-projects',
        python_callable=fetch_sonarscan_projects,
        op_kwargs={'mongo_conn_id': MONGO_CONN_ID, 'concurrency': CONCURRENCY},
        provide_context=True,
        dag=dag
    )

    shared_volume = V1Volume(
        name='secdash-airflow-shared',
        persistent_volume_claim=V1PersistentVolumeClaimVolumeSource(claim_name='secdash-airflow-shared'))

    shared_volume_mount = V1VolumeMount(
        mount_path='/opt/sonar', name='secdash-airflow-shared')

    # Step 2. Execute one or multiple instances of Zap scan runners to analyze the identified projects.
    processing_tasks = []
    for i in range(1, CONCURRENCY + 1):
        processing_tasks.append(KubernetesPodOperator(
            task_id='sonarscan-{}'.format(i),
            name='sonarscan-{}'.format(i),
            namespace='101ed4-tools',
            image='ghcr.io/bcgov/pltsvc-secdashboard-sonarscan:eeeaf9ca190beccb2a18f003df78fc24a7b619fd',
            env_vars={
                "PROJECTS": "{{" + "ti.xcom_pull(task_ids='fetch-sonarscan-projects', key='{}')".format(i) + "}}",
                "CONTEXT": MONGO_CONN_ID,
            },
            container_resources=V1ResourceRequirements(
                limits={"memory": "1Gi", "cpu": "500m"},
                requests={"memory": "500Mi", "cpu": "200m"},
            ),
            volumes=[shared_volume, ],
            volume_mounts=[shared_volume_mount, ],
            on_finish_action="delete_pod",
            in_cluster=True,
            do_xcom_push=False,
            get_logs=True,
        ))

    # Step 3. Update or create records in the database with the results obtained from the Zap scans.
    t3 = PythonOperator(
        task_id='load-sonarscan-results',
        python_callable=load_sonarscan_results,
        op_kwargs={'mongo_conn_id': MONGO_CONN_ID},
        dag=dag
    )

    t1 >> processing_tasks >> t3
