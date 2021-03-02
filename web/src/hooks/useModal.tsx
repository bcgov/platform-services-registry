import { useState } from 'react';

export const useApproveRequestModal = () => {
	const [isApprovalShown, setIsApprovalShown] = useState<boolean>(false);
	const toggleApproval = () => setIsApprovalShown(!isApprovalShown);
	return {
		isApprovalShown,
		toggleApproval,
	};
};

export const useRejectRequestModal = () => {
	const [isRejectShown, setIsRejectShown] = useState<boolean>(false);
	const toggleReject = () => setIsRejectShown(!isRejectShown);
	return {
		isRejectShown,
		toggleReject,
	};
};
