import { useState } from 'react';
import PublicCloudDeleteModal from '@/components/modal/PublicCloudDelete';
import ReturnModal from '@/components/modal/Return';
import { useParams } from 'next/navigation';
import ErrorModal from '@/components/modal/Error';
import { deletePublicCloudProject } from '@/services/backend/public-cloud/products';
import DeleteButton from '@/components/buttons/DeleteButton';

export default function Dropdown({ disabled = false }: { disabled?: boolean }) {
  const [showModal, setShowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const params = useParams();

  const onSubmit = async () => {
    setIsSubmitLoading(true);
    try {
      await deletePublicCloudProject(params.licencePlate as string);
      setShowModal(false);
      setShowReturnModal(true);
    } catch (error) {
      setErrorMessage(String(error));
      setIsSubmitLoading(false);
      setShowModal(false);
      setShowErrorModal(true);
    }
  };

  if (disabled) return null;

  return (
    <>
      <PublicCloudDeleteModal
        open={showModal}
        setOpen={setShowModal}
        isSubmitLoading={isSubmitLoading}
        onSubmit={onSubmit}
      />
      <ReturnModal
        open={showReturnModal}
        setOpen={setShowReturnModal}
        redirectUrl="/public-cloud/products/all"
        modalTitle="Thank you! We have received your delete request."
        modalMessage="We have received your delete request for this product. The Product Owner and Technical Lead(s) will receive an update via email."
      />
      <ErrorModal
        open={showErrorModal}
        setOpen={setShowErrorModal}
        errorMessage={errorMessage}
        redirectUrl="/public-cloud/products/all"
      />
      <DeleteButton canDelete={true} setShowModal={setShowModal} active={true} />
    </>
  );
}
