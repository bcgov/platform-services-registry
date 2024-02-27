import classNames from '@/components/utils/classnames';

export default function AGMinistryCheckBox({
  disabled,
  isCheckBoxShown,
  isAGMinistry,
  setIsAGMinistry,
}: {
  disabled?: boolean;
  isCheckBoxShown: boolean;
  isAGMinistry?: boolean;
  setIsAGMinistry?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const handleCheckAGMinistry = (event: { target: { checked: boolean } }) => {
    if (setIsAGMinistry && isCheckBoxShown) setIsAGMinistry(event.target.checked);
  };

  return (
    <div className="flex items-center">
      <label
        htmlFor="none"
        className={classNames(!isAGMinistry ? 'text-red-400' : '', 'mt-3 text-sm leading-6 text-gray-600')}
      >
        <input
          onChange={handleCheckAGMinistry}
          disabled={disabled}
          id="none"
          type="checkbox"
          className="mr-3 h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
        />
        * All product teams from the Ministries of Attorney General, Public Safety and Solicitor General and Emergency
        Management BC and BC Housing must engage with
        <a href="mailto: JAGMISO@gov.bc.ca" className="text-blue-500 hover:text-blue-700">
          {' '}
          AG Security{' '}
        </a>
        to prior to submitting a request for a new product.
      </label>
    </div>
  );
}
