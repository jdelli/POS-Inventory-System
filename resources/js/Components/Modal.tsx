import { PropsWithChildren } from 'react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { X } from 'lucide-react';

export default function Modal({
    children,
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose = () => {},
    title,
}: PropsWithChildren<{
    show: boolean;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    closeable?: boolean;
    onClose: CallableFunction;
    title?: string;
}>) {
    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
        '3xl': 'sm:max-w-3xl',
        '4xl': 'sm:max-w-4xl',
    }[maxWidth];

    return (
        <Transition show={show} leave="duration-200">
            <Dialog
                as="div"
                id="modal"
                className="fixed inset-0 flex overflow-y-auto px-4 py-6 sm:px-0 items-center z-50 transform transition-all"
                onClose={close}
            >
                <TransitionChild
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px]" />
                </TransitionChild>

                <TransitionChild
                    enter="ease-out duration-200"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <DialogPanel
                        className={`mb-6 bg-white rounded overflow-hidden shadow-xl transform transition-all sm:w-full sm:mx-auto ${maxWidthClass}`}
                        style={{ 
                            fontFamily: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif",
                            fontSize: '13px',
                            border: '1px solid #D1D5DB'
                        }}
                    >
                        {title && (
                            <div 
                                className="flex items-center justify-between px-4 py-2.5"
                                style={{ 
                                    background: 'linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%)',
                                    borderBottom: '1px solid #1E40AF'
                                }}
                            >
                                <h3 
                                    className="font-semibold text-white"
                                    style={{ fontSize: '0.875rem', margin: 0 }}
                                >
                                    {title}
                                </h3>
                                {closeable && (
                                    <button
                                        onClick={close}
                                        className="text-white/80 hover:text-white transition-opacity"
                                        style={{ 
                                            background: 'transparent', 
                                            border: 'none', 
                                            cursor: 'pointer',
                                            padding: '0.25rem',
                                            display: 'flex'
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        )}
                        {children}
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}
