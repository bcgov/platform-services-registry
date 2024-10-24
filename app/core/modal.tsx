import { ScrollArea } from '@mantine/core';
import { randomId } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { ModalSettings } from '@mantine/modals/lib/context';
import _isString from 'lodash-es/isString';
import React, { useMemo } from 'react';

// Interface for extra props to be passed to the modal component
interface ExtraModalProps {
  closeModal: () => void; // Function to close the modal
}

// Generic interface for modal props
interface Props<P, S> {
  settings: ModalSettings; // Modal settings
  Component: (props: P & { state: S } & ExtraModalProps) => JSX.Element | null; // Modal component
  condition?: (props: P) => boolean; // Optional condition to render the modal
  onClose?: (() => void) | undefined; // Optional onClose callback
}

// Generic interface for modal options
interface Options<S, SS> {
  initialState?: S; // Initial state for the modal
  snapshot?: SS; // Optional snapshot of the state
  settings?: ModalSettings; // Additional modal settings
  onPreClose?: (props: { state: S; snapshot?: SS }) => void; // Callback before the modal closes
}

// Function to create a modal
export function createModal<P, S = any>({ settings, Component, condition, onClose }: Props<P, S>) {
  return function openModal<SS = any>(props: P, options?: Options<S, SS>) {
    const { initialState, snapshot, settings: extraSettings, onPreClose } = options ?? {};
    const state = { ...(initialState ?? {}) } as S;

    // If condition is provided and returns false, do not open the modal
    if (condition && !condition(props)) {
      return null;
    }

    const id = settings.modalId || randomId(); // Generate a modal ID if not provided

    // Extra props to be passed to the modal component
    const extraProps: ExtraModalProps = {
      closeModal: () => modals.close(id),
    };

    // Return a promise that resolves when the modal closes
    return new Promise<{ state: S; snapshot?: SS }>((resolve, reject) => {
      const modalSettings = {
        scrollAreaComponent: ScrollArea.Autosize,
        className: '',
        overlayProps: {
          className: '',
        },
        ...settings,
        ...extraSettings,
        modalId: id,
        onClose: () => {
          const output = { state: { ...state }, snapshot };
          if (onPreClose) onPreClose(output);
          if (onClose) onClose();
          resolve(output);
        },
        children: <Component {...props} state={state} {...extraProps} />,
      };

      if (_isString(modalSettings.title)) {
        modalSettings.title = <div className="font-bold text-lg">{modalSettings.title}</div>;
      }

      modals.open(modalSettings);
    });
  };
}
