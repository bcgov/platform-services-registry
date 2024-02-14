'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { PrivateCloudProjectWithUsers } from '@/app/api/private-cloud/project/[licencePlate]/route';
import classNames from '@/components/utils/classnames';

async function fetchProject(licencePlate: string): Promise<PrivateCloudProjectWithUsers> {
  const res = await fetch(`/api/public-cloud/project/${licencePlate}`);
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

  const { data: projectData } = useQuery({
    queryKey: ['project', params.licencePlate],
    queryFn: () => fetchProject(params.licencePlate as string),
    enabled: !!params.licencePlate && open,
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

                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm text-yellow-600">
                      <div className="flex">
                        <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" aria-hidden="true" />
                        This will permanently delete your product.
                      </div>
                    </span>
                  </div>

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
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <p className="text-sm text-gray-500">This operation cannot be undone.</p>

                  {isSubmitLoading ? (
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium shadow-sm bg-gray-400 text-white cursor-not-allowed"
                    >
                      Deleting...
                    </button>
                  ) : (
                    <button
                      disabled={isDisabled}
                      type="button"
                      onClick={onSubmit}
                      className={classNames(
                        'inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium shadow-sm',
                        isDisabled
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
