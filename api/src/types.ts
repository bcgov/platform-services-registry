//
// Copyright © 2020 Province of British Columbia
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

import { ProjectNamespace } from './db/model/namespace';
import { Quotas, QuotaSize } from './db/model/quota';

export const enum NatsContextAction {
    Create = 'create',
    Edit = 'edit',
    Sync = 'sync',
}

export const enum NatsContextType {
    Standard = 'standard',
}

// the agreed json structure between api and provisioner
export interface NatsContext {
    action: NatsContextAction,
    type: NatsContextType,
    profileId: number,
    displayName: string,
    newDisplayName: string,
    description: string,
    quota: QuotaSize,
    quotas: Quotas,
    namespaces: ProjectNamespace[],
    technicalContact: {
        userId: string,
        provider: string,
        email: string,
    },
    productOwner: {
        userId: string,
        provider: string,
        email: string,
    },
}

// TODO: a bit hacky to name data members off the actual tool name
// consider natsSubject > fulfillmentSubject, natsMessage > fulfillmentMessage etc.
export interface NatsMessage {
    natsSubject: string,
    natsContext: NatsContext,
}
