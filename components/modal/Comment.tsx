import { Fragment, useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';

export default function Modal({
  open,
  setOpen,
  onSubmit,
  isLoading,
  type,
}: {
  open: boolean;
  setOpen: any;
  onSubmit: any;
  isLoading: boolean;
  type: string;
}) {
  const [comment, setComment] = useState('');
  const [confirm, setConfirm] = useState(false);
  const cancelButtonRef = useRef(null);

  const handleCommentChange = (event: any) => {
    const comment = event.target.value;
    setComment(comment);
  };

  useEffect(() => {
    setConfirm(comment.trim() !== '');
  }, [comment]);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={() => {
          setOpen(false);
          setConfirm(false);
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
                <div>
                  <div className="mt-3 sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="font-bcsans text-base lg:text-xl 2xl:text-2xl font-semibold leading-6 text-gray-900 mb-5"
                    >
                      Are you sure you want to {type} this Edit Project request?
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="font-bcsans text-sm text-gray-900">
                        Please provide your final comments to be shared.
                      </p>
                    </div>
                  </div>
                </div>
                <p className="mt-12 font-bcsans text-sm text-gray-900 font-bold">Comments</p>
                <textarea
                  onChange={handleCommentChange}
                  className="w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-slate-300-500 focus:border-slate-300-500 block px-4 py-1.5  dark:border-gray-300 dark:placeholder-gray-400 dark:text-darkergrey dark:focus:ring-slate-300 dark:focus:border-slate-300 h-24"
                  placeholder="Type in your comment..."
                />
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="px-12 rounded-md bg-white tracking-[.2em] py-2.5 text-sm font-bcsans text-bcblue shadow-sm ring-1 ring-inset ring-bcblue hover:bg-gray-50 mr-4"
                    onClick={() => {
                      setOpen(false);
                      setConfirm(false);
                    }}
                    ref={cancelButtonRef}
                  >
                    CANCEL
                  </button>
                  {isLoading ? (
                    <button
                      disabled
                      type="button"
                      className="inline-flex justify-center rounded-md bg-bcorange/50 px-4 py-2.5 font-bcsans text-bcblue text-sm tracking-[.2em] shadow-sm brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 col-start-2"
                    >
                      <div
                        className="mr-2 mt-1 inline-block h-3 w-3 animate-spin rounded-full border-3 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
                        role="status"
                      >
                        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"></span>
                      </div>
                      Loading...
                    </button>
                  ) : confirm ? (
                    <button
                      type="button"
                      onClick={() => onSubmit(comment)}
                      className="inline-flex justify-center rounded-md bg-bcorange px-4 py-2.5 font-bcsans text-bcblue text-sm tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 col-start-2"
                    >
                      {type.toUpperCase()}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex justify-center rounded-md bg-bcorange/50 px-4 py-2.5 font-bcsans text-bcblue text-sm tracking-[.2em] shadow-sm brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 col-start-2"
                    >
                      {type.toUpperCase()}
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
