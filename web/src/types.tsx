//
// Copyright © 2020 Province of British Columbia
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { default as React, MouseEventHandler } from 'react';

export type ColorSet
  = 'contrast'
  | 'primary'

export type LayoutSet
  = 'unauth'
  | 'auth'
  | 'min'

export interface MenuItem {
  title: string;
  subTitle: string;
  href?: string;
  onClickCB?: MouseEventHandler<React.ReactNode>;
  handleOnClick?: MouseEventHandler<React.ReactNode>;
}

export type QuotaSizeSet
  = 'small'
  | 'medium'
  | 'large'

interface ClusterNamespace {
  clusterId: string;
  namespaceId: string;
  provisioned?: boolean;
}

export interface CNQuotas extends ClusterNamespace {
  quotaCpu: QuotaSizeSet;
  quotaMemory: QuotaSizeSet;
  quotaStorage: QuotaSizeSet;
}

export interface CNQuotaOptions extends ClusterNamespace {
  quotaCpu: QuotaSizeSet[] | [];
  quotaMemory: QuotaSizeSet[] | [];
  quotaStorage: QuotaSizeSet[] | [];
}

export interface NamespaceCNQuotaObj {
  cpu: QuotaSizeSet;
  memory: QuotaSizeSet;
  storage: QuotaSizeSet;
}

export interface NamespaceCN {
  clusterId: string;
  name: string;
  provisioned: boolean;
  quotas: NamespaceCNQuotaObj;
}

export interface Namespace {
  namespaceId: string;
  name: string;
  clusters: NamespaceCN[];
}