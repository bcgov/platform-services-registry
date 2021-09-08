import { useCallback } from 'react';

export const useHandleSort = (setData: any, profileDetails: any) => {
  const ourHandleSort = useCallback(
    (sortBy) => {
      // Doing multisort
      const sorted = profileDetails.slice();
      sorted.sort((a: any, b: any) => {
        for (let i = 0; i < sortBy.length; ++i) {
          if (typeof a[sortBy[i].id] === 'object') {
            if (sortBy[i].id === 'clusters') {
              if (a[sortBy[i].id][0] > b[sortBy[i].id][0]) return sortBy[i].desc ? -1 : 1;
              if (a[sortBy[i].id][0] < b[sortBy[i].id][0]) return sortBy[i].desc ? 1 : -1;
            }
            if (sortBy[i].id === 'productOwners') {
              if (a[sortBy[i].id][0].email > b[sortBy[i].id][0].email)
                return sortBy[i].desc ? -1 : 1;
              if (a[sortBy[i].id][0].email < b[sortBy[i].id][0].email)
                return sortBy[i].desc ? 1 : -1;
            }
            if (sortBy[i].id === 'technicalLeads') {
              if (a[sortBy[i].id][0].email > b[sortBy[i].id][0].email)
                return sortBy[i].desc ? -1 : 1;
              if (a[sortBy[i].id][0].email < b[sortBy[i].id][0].email)
                return sortBy[i].desc ? 1 : -1;
            }
          } else {
            if (a[sortBy[i].id] > b[sortBy[i].id]) return sortBy[i].desc ? -1 : 1;
            if (a[sortBy[i].id] < b[sortBy[i].id]) return sortBy[i].desc ? 1 : -1;
          }
        }
        return 0;
      });
      setData(sorted);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profileDetails],
  );
  return { ourHandleSort };
};
