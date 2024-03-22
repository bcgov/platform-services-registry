import prisma from '@/core/prisma';

export async function deleteOp(licencePlate: string, commentId: string) {
  const deleteResponse = await prisma.privateCloudComment.deleteMany({
    where: {
      AND: [{ id: commentId }, { project: { licencePlate: licencePlate } }],
    },
  });

  // Check if a comment was deleted by inspecting the count in the deleteResponse
  return deleteResponse.count > 0;
}
