import { Dialog, Transition } from '@headlessui/react';
import classNames from 'classnames';
import { Fragment, useRef, useState } from 'react';

export default function Modal({
  open,
  setOpen,
  handleSubmit,
  isLoading,
}: {
  open: boolean;
  setOpen: any;
  handleSubmit: any;
  isLoading: boolean;
}) {
  const [comment, setComment] = useState('');

  const cancelButtonRef = useRef(null);

  const handleCommentChange = (event: any) => {
    setComment(event.target.value);
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
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
                <div className="mt-3 sm:mt-5">
                  <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900 mb-4">
                    All Set?
                  </Dialog.Title>
                  <p className="text-sm text-gray-900 font-medium mb-4">
                    Tell us a little bit about why you are requesting a change. Your comment will be saved as part of
                    the request history for future reference.
                  </p>
                  <textarea
                    onChange={handleCommentChange}
                    className="w-full border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 h-24 mb-6"
                    placeholder="Type in your comment..."
                  />

                  <p className="text-sm text-gray-900 mt-4">
                    Also, look out for our notification emails, that will provide you with valuable information
                    regarding your product status and details.
                  </p>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="px-12 rounded-md bg-white tracking-[.2em] py-2.5 text-sm text-bcblue shadow-sm ring-1 ring-inset ring-bcblue hover:bg-gray-50 mr-4"
                    // "mt-3 inline-flex items-center justify-center -md bg-white text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                    onClick={() => setOpen(false)}
                    ref={cancelButtonRef}
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    disabled={comment.trim() === ''}
                    onClick={() => handleSubmit(comment)}
                    className={classNames(
                      'inline-flex rounded-md shadow-sm px-4 py-2.5 text-sm tracking-[.2em]',
                      isLoading
                        ? 'justify-center bg-bcorange/50 text-bcblue brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 col-start-2'
                        : comment.trim() !== ''
                          ? 'justify-center bg-bcorange text-bcblue hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 col-start-2' // eslint-disable-line prettier/prettier
                          : 'justify-center bg-bcorange/50 text-bcblue brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 col-start-2', // eslint-disable-line prettier/prettier
                    )}
                  >
                    {isLoading ? (
                      <>
                        <div
                          className="mr-2 mt-1 inline-block h-3 w-3 animate-spin rounded-full border-3 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
                          role="status"
                        />
                        Loading...
                      </>
                    ) : (
                      'Submit'
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
