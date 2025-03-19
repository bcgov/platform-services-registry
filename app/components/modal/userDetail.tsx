'use client';

import { Indicator, Avatar, Tabs, Alert } from '@mantine/core';
import {
  IconCircleCheckFilled,
  IconXboxX,
  IconBrandDebian,
  IconBuilding,
  IconLocation,
  IconMail,
  IconUser,
  IconIdBadge,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import _castArray from 'lodash-es/castArray';
import _compact from 'lodash-es/compact';
import _sortBy from 'lodash-es/sortBy';
import _startCase from 'lodash-es/startCase';
import _uniqBy from 'lodash-es/uniqBy';
import { ministryMap } from '@/components/badges/MinistryBadge';
import CopyableButton from '@/components/generic/button/CopyableButton';
import MailLink from '@/components/generic/button/MailLink';
import LoadingBox from '@/components/generic/LoadingBox';
import UserProfile from '@/components/users/UserProfile';
import { createModal } from '@/core/modal';
import { formatFullName } from '@/helpers/user';
import { getUserImageData } from '@/helpers/user-image';
import { getUser } from '@/services/backend/user';
import { UserDetailWithColeagues } from '@/types/user';
import { formatDate } from '@/utils/js';

interface ModalProps {
  userId: string;
}

interface ModalState {}

function timeAgo(lastSeen: string | Date): string {
  if (!lastSeen) return 'No recent activity found';

  const lastSeenDate = new Date(lastSeen);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - lastSeenDate.getTime()) / 1000);

  if (diffInSeconds < 60) return `Last seen ${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `Last seen ${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `Last seen ${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `Last seen ${Math.floor(diffInSeconds / 86400)} days ago`;
}

function UserDetails({ data }: { data?: UserDetailWithColeagues }) {
  if (!data) {
    data = {
      id: '',
      providerUserId: '',
      firstName: '',
      lastName: '',
      email: '',
      upn: '',
      idir: '',
      idirGuid: '',
      officeLocation: '',
      jobTitle: '',
      image: '',
      ministry: '',
      archived: false,
      lastSeen: null,
      onboardingDate: null,
      privateCloudProjectsAsProjectOwner: [],
      privateCloudProjectsAsPrimaryTechnicalLead: [],
      privateCloudProjectsAsSecondaryTechnicalLead: [],
      publicCloudProjectsAsProjectOwner: [],
      publicCloudProjectsAsPrimaryTechnicalLead: [],
      publicCloudProjectsAsSecondaryTechnicalLead: [],
      publicCloudProjectsAsExpenseAuthority: [],
      colleagues: [],
    };
  }

  let indicatorColor = '#D3D3D3';
  let indicatorProcessing = false;

  // Active for the last 1 minute
  const ONE_MINUTE = 60 * 1000;
  if (data.lastSeen && Date.now() - new Date(data.lastSeen).getTime() < ONE_MINUTE) {
    indicatorColor = 'green';
    indicatorProcessing = true;
  }

  const privateCloudProducts = _uniqBy(
    [
      ...data.privateCloudProjectsAsProjectOwner,
      ...data.privateCloudProjectsAsPrimaryTechnicalLead,
      ...data.privateCloudProjectsAsSecondaryTechnicalLead,
    ],
    (v) => v.id,
  );

  const publicCloudProducts = _uniqBy(
    [
      ...data.publicCloudProjectsAsProjectOwner,
      ...data.publicCloudProjectsAsPrimaryTechnicalLead,
      ...data.publicCloudProjectsAsSecondaryTechnicalLead,
    ],
    (v) => v.id,
  );

  return (
    <div className="mb-3 mx-2 overflow-x-hidden">
      <div className="flex gap-4 mb-2">
        <Indicator
          position="bottom-end"
          color={indicatorColor}
          processing={indicatorProcessing}
          inline
          offset={10}
          size={20}
        >
          <Avatar src={getUserImageData(data.image)} size={80} radius="50%" />
        </Indicator>
        <div>
          <div className="flex text-2xl font-bold">{formatFullName(data, true)}</div>
          <div className="flex text-base font-semibold opacity-50">
            {_compact([data.jobTitle, data.officeLocation]).join(' • ')}
          </div>
        </div>
      </div>
      <Tabs defaultValue="overview">
        <Tabs.List>
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="products">Products</Tabs.Tab>
          <Tabs.Tab value="colleagues">People work with</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          {indicatorProcessing ? (
            <Alert
              variant="light"
              color="success"
              className="text-gray-700"
              title="Available"
              icon={<IconCircleCheckFilled color="green" />}
            />
          ) : (
            <Alert variant="light" color="gray" title={timeAgo(data.lastSeen ?? '')} icon={<IconXboxX />} />
          )}
          <h3 className="font-semibold my-4">Contact information</h3>
          <div className="grid grid-cols-3 gap-x-2 gap-y-6 w-full">
            <div className="col-span-1 flex items-center">
              <div className="mr-1">
                <IconMail className="text-gray-600" />
              </div>
              <div>
                <div className="text-gray-600 leading-6">Email</div>
                <div className="">
                  <MailLink to={data.email} displayIcon={false} />
                </div>
              </div>
            </div>
            <div className="col-span-1 flex items-center">
              <div className="mr-1">
                <IconBrandDebian className="text-gray-600" />
              </div>
              <div>
                <div className="text-gray-600 leading-6">IDIR</div>
                <div className="text-xs">
                  {data.idir ? <CopyableButton>{data.idir}</CopyableButton> : <span>&nbsp;</span>}
                </div>
              </div>
            </div>
            <div className="col-span-1 flex items-center">
              <div className="mr-1">
                <IconIdBadge className="text-gray-600" />
              </div>
              <div>
                <div className="text-gray-600 leading-6">UPN</div>
                <div className="text-xs">
                  {data.upn ? <CopyableButton>{data.upn}</CopyableButton> : <span>&nbsp;</span>}
                </div>
              </div>
            </div>
            <div className="col-span-1 flex items-center">
              <div className="mr-1">
                <IconBuilding className="text-gray-600" />
              </div>
              <div>
                <div className="text-gray-600 leading-6">Ministry</div>
                <div className="text-xs">
                  {data.ministry ? (
                    <CopyableButton>{ministryMap[data.ministry] ?? data.ministry}</CopyableButton>
                  ) : (
                    <span>&nbsp;</span>
                  )}
                </div>
              </div>
            </div>
            <div className="col-span-1 flex items-center">
              <div className="mr-1">
                <IconLocation className="text-gray-600" />
              </div>
              <div>
                <div className="text-gray-600 leading-6">Location</div>
                <div className="text-xs">
                  {data.officeLocation ? <CopyableButton>{data.officeLocation}</CopyableButton> : <span>&nbsp;</span>}
                </div>
              </div>
            </div>
            <div className="col-span-1 flex items-center">
              <div className="mr-1">
                <IconUser className="text-gray-600" />
              </div>
              <div>
                <div className="text-gray-600 leading-6">Job title</div>
                <div className="text-xs">
                  {data.jobTitle ? <CopyableButton>{data.jobTitle}</CopyableButton> : <span>&nbsp;</span>}
                </div>
              </div>
            </div>
          </div>
          <div className="underline italic text-gray-500 mt-4">
            {data.onboardingDate
              ? `Onboarded on ${formatDate(data.onboardingDate)}`
              : 'Onboarding information is not available'}
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="products">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <h3 className="font-semibold mt-6 underline mb-2">Private Cloud Products</h3>
              <ul className="">
                {privateCloudProducts.length > 0 ? (
                  privateCloudProducts.map((prod) => {
                    return (
                      <li
                        key={prod.id}
                        className="hover:bg-gray-100 transition-colors duration-200 grid grid-cols-5 gap-4 px-3 py-1 text-sm"
                      >
                        <div className="col-span-4">
                          <div>
                            <span className="font-normal">{prod.name}</span>
                          </div>
                        </div>
                        <div className="col-span-1 text-right"></div>
                      </li>
                    );
                  })
                ) : (
                  <li className="italic text-gray-400 text-sm">No products found</li>
                )}
              </ul>
            </div>
            <div className="col-span-1">
              <h3 className="font-semibold mt-6 underline mb-2">Public Cloud Products</h3>
              <ul className="">
                {publicCloudProducts.length > 0 ? (
                  publicCloudProducts.map((prod) => {
                    return (
                      <li
                        key={prod.id}
                        className="hover:bg-gray-100 transition-colors duration-200 grid grid-cols-5 gap-4 px-3 py-1 text-sm"
                      >
                        <div className="col-span-4">
                          <div>
                            <span className="font-normal">{prod.name}</span>
                          </div>
                        </div>
                        <div className="col-span-1 text-right"></div>
                      </li>
                    );
                  })
                ) : (
                  <li className="italic text-gray-400 text-sm">No products found</li>
                )}
              </ul>
            </div>
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="colleagues">
          <div className="grid grid-cols-3 gap-x-2 gap-y-6 w-full mt-4">
            {data.colleagues.length > 0 ? (
              data.colleagues.map((colleague) => {
                return (
                  <div key={colleague.id}>
                    <UserProfile data={colleague} />
                  </div>
                );
              })
            ) : (
              <div className="italic text-gray-400 text-sm">No people found</div>
            )}
          </div>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}

export const openUserDetailModal = createModal<ModalProps, ModalState>({
  settings: {
    size: 'xl',
    title: '',
    withCloseButton: true,
    closeOnClickOutside: true,
    closeOnEscape: true,
  },
  Component: function ({ userId, closeModal }) {
    const { data: user, isLoading: isUserLoading } = useQuery({
      queryKey: ['userDetail', userId],
      queryFn: () => getUser(userId),
      enabled: !!userId,
    });

    return (
      <LoadingBox isLoading={isUserLoading}>
        <UserDetails data={user} />
      </LoadingBox>
    );
  },
  onClose: () => {},
  condition: (props) => !!props.userId,
});
