/** @jest-environment jsdom */
/**
 * The above comment is required to use the jsdom environment for this test file.
 * It allows us to test UI components.
 * The api unit tests are run in a node environment so we don't want to set jsdom
 * as the default environment for all tests in jest.config.mjs
 */

import { describe, it, expect, jest } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import FormTextarea from './FormTextarea';

describe('FormTextarea', () => {
  it('does not render a character counter when maxLength is not set', () => {
    render(<FormTextarea name="description" label="Description" />);

    expect(screen.queryByText(/\d+\s*\/\s*\d+/)).toBeNull();
  });

  it('renders initial character count from defaultValue when maxLength is set', async () => {
    render(
      <FormTextarea
        name="quotaJustification"
        label="Reason for quota increase request"
        maxLength={10}
        defaultValue="abcd"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('4 / 10')).toBeInTheDocument();
    });
  });

  it('renders initial character count as 0 when defaultValue is not sent when maxLength is set', async () => {
    render(<FormTextarea name="quotaJustification" label="Reason for quota increase request" maxLength={10} />);

    await waitFor(() => {
      expect(screen.getByText('0 / 10')).toBeInTheDocument();
    });
  });

  it('updates character count and forwards onChange to both handlers', async () => {
    const inputPropsOnChange = jest.fn();
    const outerOnChange = jest.fn();

    render(
      <FormTextarea
        name="quotaJustification"
        label="Reason"
        maxLength={20}
        inputProps={{ onChange: inputPropsOnChange }}
        onChange={outerOnChange}
      />,
    );

    // count should be 0 before any input
    await waitFor(() => {
      expect(screen.getByText('0 / 20')).toBeInTheDocument();
    });

    expect(inputPropsOnChange).toHaveBeenCalledTimes(0);
    expect(outerOnChange).toHaveBeenCalledTimes(0);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'hello' } });

    expect(screen.getByText('5 / 20')).toBeInTheDocument();
    expect(inputPropsOnChange).toHaveBeenCalledTimes(1);
    expect(outerOnChange).toHaveBeenCalledTimes(1);
  });

  it('updates character count and forwards onChange to both handlers when defaultValue is set', async () => {
    const inputPropsOnChange = jest.fn();
    const outerOnChange = jest.fn();

    render(
      <FormTextarea
        name="quotaJustification"
        label="Reason"
        maxLength={20}
        defaultValue="initial"
        inputProps={{ onChange: inputPropsOnChange }}
        onChange={outerOnChange}
      />,
    );

    // count should be 7 (length of "initial") before changing the input
    await waitFor(() => {
      expect(screen.getByText('7 / 20')).toBeInTheDocument();
    });

    expect(inputPropsOnChange).toHaveBeenCalledTimes(0);
    expect(outerOnChange).toHaveBeenCalledTimes(0);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'hello' } });

    expect(screen.getByText('5 / 20')).toBeInTheDocument();
    expect(inputPropsOnChange).toHaveBeenCalledTimes(1);
    expect(outerOnChange).toHaveBeenCalledTimes(1);
  });
});
