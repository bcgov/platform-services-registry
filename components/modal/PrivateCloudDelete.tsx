'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { PrivateCloudProjectWithUsers } from '@/app/api/private-cloud/project/[licencePlate]/route';
import classNames from '@/components/utils/classnames';

async function fetchDeleteCheckResult(licencePlate: string) {
  const res = await fetch(`/api/private-cloud/deletion-check/${licencePlate}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Network response was not ok for deletion check');
  }

  const data = await res.json();

  return data;
}

async function fetchProject(licencePlate: string): Promise<PrivateCloudProjectWithUsers> {
  const res = await fetch(`/api/private-cloud/project/${licencePlate}`);
  if (!res.ok) {
    throw new Error('Network response was not ok for fetch project');
  }

  // Re format data to work with form
  const data = await res.json();

  // Secondaty technical lead should only be included if it exists
  if (data.secondaryTechnicalLead === null) {
    delete data.secondaryTechnicalLead;
  }

  return data;
}

export default function Modal({
  open,
  setOpen,
  isSubmitLoading,
  onSubmit,
}: {
  open: boolean;
  setOpen: any;
  isSubmitLoading: boolean;
  onSubmit: any;
}) {
  const params = useParams();
  const cancelButtonRef = useRef(null);
  const [isDisabled, setDisabled] = useState(true);
  const [email, setEmail] = useState('');
  const [licencePlate, setLicencePlate] = useState('');
  const [deletionCheckData, setDeletionCheckData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchDeletionCheck = async () => {
        try {
          setIsLoading(true);
          const data = await fetchDeleteCheckResult(params.licencePlate as string);
          setDeletionCheckData(data);
        } catch (error) {
          console.error('Error fetching deletion check:', error);
        }
        setIsLoading(false);
      };

      fetchDeletionCheck();
    } else {
      setDeletionCheckData(null);
    }
  }, [open, params.licencePlate]);

  const { data: projectData } = useQuery({
    queryKey: ['project', params.licencePlate],
    queryFn: () => fetchProject(params.licencePlate as string),
    enabled: !!params.licencePlate && open,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (licencePlate === projectData?.licencePlate && email === projectData?.projectOwner?.email.toLocaleLowerCase()) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [projectData?.licencePlate, projectData?.projectOwner?.email, licencePlate, email]);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={() => {
          setOpen(false);
        }}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Please confirm your delete request</h3>

                  {isLoading ? (
                    <div className="flex items-center">
                      <svg
                        aria-hidden="true"
                        className="mr-3 w-4 h-4 text-gray-200 animate-spin dark:text-gray-200 fill-blue-600"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentFill"
                        />
                      </svg>
                      <span className="text-sm text-gray-500"> Checking delete status...</span>
                    </div>
                  ) : deletionCheckData !== 'OK_TO_DELETE' ? (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-sm text-red-600">
                        <div className="flex">
                          <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" aria-hidden="true" />
                          Please remember to remove all pods and PVCs from all four namespaces before trying to delete
                          again.
                        </div>
                      </span>
                      <p className="text-sm text-gray-500">Deletion check has failed.</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-sm text-green-600">
                        <div className="flex">
                          <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" aria-hidden="true" />
                          Ready to Delete
                        </div>
                      </span>
                      <p className="text-sm text-gray-500">Deletion check has passed.</p>
                    </div>
                  )}

                  <div className="border-t border-gray-300 pt-4">
                    <div className="space-y-1">
                      <span className="flex">
                        <p className="text-sm font-medium text-gray-900">Product Name: </p>
                        <p className="text-sm text-gray-900 ml-2">{projectData?.name}</p>
                      </span>
                      <span className="flex">
                        <p className="text-sm font-medium text-gray-900">License Plate: </p>
                        <p className="text-sm text-gray-900 ml-2">{projectData?.licencePlate}</p>
                      </span>
                      <span className="flex">
                        <p className="text-sm font-medium text-gray-900">Product Owner: </p>
                        <p className="text-sm text-gray-900 ml-2">
                          {projectData?.projectOwner?.email.toLocaleLowerCase()}
                        </p>
                      </span>
                    </div>

                    {deletionCheckData === null ? (
                      <p className="mt-8 text-sm text-gray-500">
                        Our deletion check is making sure there are no resources deployed in your namespaces.
                      </p>
                    ) : deletionCheckData !== 'OK_TO_DELETE' ? (
                      <p className="mt-8 text-sm text-gray-500">
                        Our deletion check did not pass, this means there are still resources deployed on your product.
                      </p>
                    ) : (
                      <div>
                        <p className="mt-8 text-sm text-gray-500">
                          Are you sure you want to delete this product? Enter the following data to proceed:
                        </p>

                        <div className="mt-4">
                          <label htmlFor="license-plate" className="sr-only">
                            License Plate Number
                          </label>
                          <input
                            value={licencePlate}
                            onChange={(e) => setLicencePlate(e.target.value)}
                            type="text"
                            name="license-plate"
                            id="license-plate"
                            className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="License Plate Number"
                          />
                        </div>

                        <div className="mt-4">
                          <label htmlFor="owner-email" className="sr-only">
                            Product Owner Email
                          </label>
                          <input
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            type="email"
                            name="owner-email"
                            id="owner-email"
                            className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Product Owner Email"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  {deletionCheckData !== 'OK_TO_DELETE' ? (
                    <p className="text-sm text-gray-500">You are unable to delete this product.</p>
                  ) : (
                    <p className="text-sm text-gray-500">This operation cannot be undone.</p>
                  )}
                  {isSubmitLoading ? (
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium shadow-sm bg-gray-400 text-white cursor-not-allowed"
                    >
                      Deleting...
                    </button>
                  ) : (
                    <button
                      disabled={isDisabled || deletionCheckData !== 'OK_TO_DELETE'}
                      type="button"
                      onClick={onSubmit}
                      className={classNames(
                        'inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium shadow-sm',
                        isDisabled || deletionCheckData !== 'OK_TO_DELETE'
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700',
                      )}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
