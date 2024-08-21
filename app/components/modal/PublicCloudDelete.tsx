import { IconExclamationCircle } from '@tabler/icons-react';
import classNames from 'classnames';
import { Fragment, useEffect, useRef, useState } from 'react';
import Modal from '@/components/generic/modal/Modal';
import { usePublicProductState } from '@/states/global';

export default function PublicCloudDeleteModal({
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
  const [publicProductState, publicProductSnapshot] = usePublicProductState();
  const [isDisabled, setDisabled] = useState(true);
  const [email, setEmail] = useState('');
  const [licencePlate, setLicencePlate] = useState('');

  useEffect(() => {
    if (
      licencePlate === publicProductSnapshot.currentProduct?.licencePlate &&
      email === publicProductSnapshot.currentProduct?.projectOwner?.email.toLocaleLowerCase()
    ) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [publicProductSnapshot.currentProduct, licencePlate, email]);

  return (
    <Modal isOpen={open} onClose={() => setOpen(false)} className="sm:max-w-2xl">
      {!publicProductSnapshot.currentProduct?.expenseAuthorityId ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Expense Authority Form Required for Product Deletion
          </h3>
          <div className="flex items-center justify-between">
            <span className="flex items-center text-sm text-yellow-600">
              <div className="flex">
                <IconExclamationCircle className="h-5 w-5 mr-2 flex-shrink-0" aria-hidden="true" />
                Attention:
              </div>
            </span>
          </div>
          <p className="text-sm font-medium text-gray-900">
            Before proceeding with the deletion of this product, please note that you are required to fill out the
            Expense Authority Form. This form is necessary to ensure proper authorization for any expenses related to
            this product.
          </p>
          <h3 className="text-lg font-medium leading-6 text-gray-900">Why is the Expense Authority Form Required?</h3>
          <p className="text-sm font-medium text-gray-900">
            The Expense Authority Form helps us maintain transparency and accountability in our expense management
            process. It ensures that all deletions and associated costs are approved by the appropriate authorities
            within your organization.
          </p>
          <p className="text-sm font-medium text-gray-900">
            Once your Expense Authority Form has been filled in, you will be able to proceed with the deletion of the
            product.
          </p>
          <p className="text-sm font-medium text-gray-900">
            Thank you for your cooperation and understanding. If you have any questions or need further assistance,
            please don&apos;t hesitate to contact our support team{' '}
            <a href="mailto:Cloud.Pathfinder@gov.bc.ca" className="text-blue-500 hover:text-blue-700">
              Cloud.Pathfinder@gov.bc.ca
            </a>
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Please confirm your delete request</h3>

            <div className="flex items-center justify-between">
              <span className="flex items-center text-sm text-yellow-600">
                <div className="flex">
                  <IconExclamationCircle className="h-5 w-5 mr-2 flex-shrink-0" aria-hidden="true" />
                  <a
                    href="https://digital.gov.bc.ca/cloud/services/public/intro/#closure"
                    target="_blank"
                    rel="noreferrer"
                  >
                    https://digital.gov.bc.ca/cloud/services/public/intro/#closure
                  </a>
                </div>
              </span>
            </div>

            <div className="border-t border-gray-300 pt-4">
              <div className="space-y-1">
                <span className="flex">
                  <p className="text-sm font-medium text-gray-900">Product Name: </p>
                  <p className="text-sm text-gray-900 ml-2">{publicProductSnapshot.currentProduct?.name}</p>
                </span>
                <span className="flex">
                  <p className="text-sm font-medium text-gray-900">Licence Plate: </p>
                  <p className="text-sm text-gray-900 ml-2">{publicProductSnapshot.currentProduct?.licencePlate}</p>
                </span>
                <span className="flex">
                  <p className="text-sm font-medium text-gray-900">Product Owner: </p>
                  <p className="text-sm text-gray-900 ml-2">
                    {publicProductSnapshot.currentProduct?.projectOwner?.email.toLocaleLowerCase()}
                  </p>
                </span>
              </div>

              <div>
                <p className="mt-8 text-sm text-gray-500">
                  Are you sure you want to delete this product? Enter the following data to proceed:
                </p>

                <div className="mt-4">
                  <label htmlFor="licence-plate" className="sr-only">
                    Licence Plate Number
                  </label>
                  <input
                    value={licencePlate}
                    onChange={(e) => setLicencePlate(e.target.value)}
                    type="text"
                    name="licence-plate"
                    id="licence-plate"
                    className="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Licence Plate Number"
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
                    className="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Product Owner Email"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-red-500 font-bold">This operation cannot be undone!</p>

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
                  isDisabled ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700',
                )}
              >
                Delete
              </button>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
