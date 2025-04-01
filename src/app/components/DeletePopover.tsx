'use client';

import { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';

interface DeletePopoverProps {
  onConfirm: () => void;
  children: React.ReactNode;
}

export default function DeletePopover({
  onConfirm,
  children
}: DeletePopoverProps) {
  return (
    <Popover className="relative">
      {children}
      
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10">
          <div className="bg-white rounded-lg shadow-xl ring-1 ring-black/5 p-4 min-w-[140px]">
            <p className="text-xs text-secondary-700 mb-3 text-center font-medium">
              确定要删除吗？
            </p>
            <div className="flex gap-2 justify-center">
              <Popover.Button className="min-w-[48px] px-3 py-1.5 text-xs border border-secondary-200 text-secondary-600 rounded-md hover:bg-secondary-50 hover:border-secondary-300 transition-all">
                取消
              </Popover.Button>
              <Popover.Button
                className="min-w-[48px] px-3 py-1.5 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition-all"
                onClick={onConfirm}
              >
                删除
              </Popover.Button>
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
} 