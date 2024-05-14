import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useRef, useState } from 'react';

export default function Modal({
  open,
  setOpen,
  onSubmit,
  isLoading,
  type,
  action,
}: {
  open: boolean;
  setOpen: any;
  onSubmit: any;
  isLoading: boolean;
  type?: string;
  action?: 'APPROVE' | 'REJECT' | null;
}) {
  const [comment, setComment] = useState('');
  const cancelButtonRef = useRef(null);

  const handleCommentChange = (event: any) => {
    const comm = event.target.value;
    setComment(comm);
  };

  const showCommentsBox = () => {
    if (
      action === 'APPROVE' &&
      (type?.toLowerCase() === 'create' || type?.toLowerCase() === 'edit' || type?.toLowerCase() === 'delete')
    ) {
      return false;
    }

    return true;
  };

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
                <div className="mt-3 sm:mt-5">
                  <Dialog.Title
                    as="h3"
                    className="text-base lg:text-xl 2xl:text-2xl font-semibold leading-6 text-gray-900 mb-5"
                  >
                    {action === 'APPROVE'
                      ? `Are you sure you want to approve this ${type?.toLocaleLowerCase()} product request?`
                      : `Are you sure you want to reject this ${type?.toLocaleLowerCase()} product request?`}
                  </Dialog.Title>
                </div>
                {showCommentsBox() && (
                  <>
                    <p className="pt-2 text-sm text-gray-900">Please provide your final comments to be shared.</p>
                    <p className="mt-6 pb-2 text-sm text-gray-900 font-bold">Comments</p>
                    <textarea
                      onChange={handleCommentChange}
                      className="w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-300-500 focus:border-slate-300-500 block px-4 py-1.5  dark:border-gray-300 dark:placeholder-gray-400 dark:text-darkergrey dark:focus:ring-slate-300 dark:focus:border-slate-300 h-24"
                      placeholder="Type in your comment..."
                    />
                  </>
                )}
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="px-12 rounded-md bg-white tracking-[.2em] py-2.5 text-sm text-bcblue shadow-sm ring-1 ring-inset ring-bcblue hover:bg-gray-50 mr-4"
                    onClick={() => {
                      setOpen(false);
                    }}
                    ref={cancelButtonRef}
                  >
                    CANCEL
                  </button>
                  {isLoading ? (
                    <button
                      disabled
                      type="button"
                      className="inline-flex justify-center rounded-md bg-bcorange/50 px-4 py-2.5 text-bcblue text-sm tracking-[.2em] shadow-sm brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 col-start-2"
                    >
                      <div
                        className="mr-2 mt-1 inline-block h-3 w-3 animate-spin rounded-full border-3 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
                        role="status"
                      >
                        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"></span>
                      </div>
                      Loading...
                    </button>
                  ) : (
                    <button
                      disabled={!confirm}
                      type="button"
                      onClick={() => onSubmit(comment)}
                      className={`inline-flex justify-center rounded-md bg-bcorange px-4 py-2.5 text-bcblue text-sm tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 col-start-2`}
                    >
                      {action === 'APPROVE' ? 'CONFIRM APPROVAL' : 'CONFIRM REJECTION'}
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
