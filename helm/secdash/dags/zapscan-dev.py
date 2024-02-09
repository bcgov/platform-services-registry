from datetime import timedelta, datetime

from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.cncf.kubernetes.operators.kubernetes_pod import (
    KubernetesPodOperator,
)
from airflow.utils.trigger_rule import TriggerRule
from kubernetes.client import V1VolumeMount, V1Volume, V1ResourceRequirements, V1PersistentVolumeClaimVolumeSource
from projects import fetch_zap_projects, load_zap_results

YESTERDAY = datetime.now() - timedelta(days=1)
CONCURRENCY = 5
MONGO_CONN_ID = 'pltsvc-dev'

with DAG(
    dag_id="zapscan_dev",
    schedule_interval="0 12 * * *",
    start_date=YESTERDAY,
    concurrency=CONCURRENCY,
) as dag:

    # Step 1. Identify and gather information for all currently active projects, including their host details.
    t1 = PythonOperator(
        task_id='fetch-zapscan-projects-dev',
        python_callable=fetch_zap_projects,
        op_kwargs={'mongo_conn_id': MONGO_CONN_ID, 'concurrency': CONCURRENCY},
        provide_context=True,
        dag=dag
    )

    shared_volume = V1Volume(
        name='secdash-airflow-shared',
        persistent_volume_claim=V1PersistentVolumeClaimVolumeSource(claim_name='secdash-airflow-shared'))

    shared_volume_mount = V1VolumeMount(
        mount_path='/zap/wrk', name='secdash-airflow-shared')

    # Step 2. Execute one or multiple instances of Zap scan runners to analyze the identified projects.
    processing_tasks = []
    for i in range(1, CONCURRENCY + 1):
        processing_tasks.append(KubernetesPodOperator(
            task_id='zap-baseline-{}'.format(i),
            name='zap-baseline-{}'.format(i),
            namespace='101ed4-tools',
            image='ghcr.io/bcgov/pltsvc-secdashboard-zap:cfae855b59e1eeacb44f2f0d057cef7081b0d223',
            env_vars={
                "PROJECTS": "{{" + "ti.xcom_pull(task_ids='fetch-zapscan-projects-dev', key='{}')".format(i) + "}}",
                "CONTEXT": MONGO_CONN_ID,
            },
            container_resources=V1ResourceRequirements(
                limits={"memory": "1Gi", "cpu": "1000m"},
                requests={"memory": "200Mi", "cpu": "50m"},
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
        task_id='load-zap-results',
        python_callable=load_zap_results,
        op_kwargs={'mongo_conn_id': MONGO_CONN_ID},
        trigger_rule=TriggerRule.ALL_DONE,
        dag=dag
    )

    t1 >> processing_tasks >> t3
