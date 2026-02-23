## [0.78.8](https://github.com/bcgov/platform-services-registry/compare/v0.78.7...v0.78.8) (2026-02-20)

### Bug Fixes

* **2670:** add --timeout and --wait to install and upgrade ([46e2245](https://github.com/bcgov/platform-services-registry/commit/46e224508476a21a91b3f4ea30a33a4d2a88e3fd))
* **2670:** extend DAG hook deadline and Helm timeout to prevent upgrade timeouts ([a5581a9](https://github.com/bcgov/platform-services-registry/commit/a5581a9197d894574bf6ef30e8224654d75c60ed))
* **2670:** increase HELM_TIMEOUT from 20m to 45m for helm/main ([60ba869](https://github.com/bcgov/platform-services-registry/commit/60ba869848cedd6afa58079c4f3a57e4b5f263c7))
* **2670:** increase HELM_TIMEOUT from 20m to 45m to prevent CI job timeout ([f36a40b](https://github.com/bcgov/platform-services-registry/commit/f36a40b9d3f5b3bd33baa1dcaefd920ea40c7c08))
* **2670:** increase job timeout to 60 minutes ([f91048a](https://github.com/bcgov/platform-services-registry/commit/f91048aad1e15cb3ac3e97bb550198334a3c386c))
* **2670:** increase job timeout to 60 minutes ([dbd68ac](https://github.com/bcgov/platform-services-registry/commit/dbd68ac8110e456ffdee0e181f3d5c219265a77b))
## [0.78.7](https://github.com/bcgov/platform-services-registry/compare/v0.78.6...v0.78.7) (2026-02-11)
## [0.78.6](https://github.com/bcgov/platform-services-registry/compare/v0.78.5...v0.78.6) (2026-02-09)

### Bug Fixes

* **0000:** approve pnpm build scripts and rebuild canvas in pipeline ([fbb0e11](https://github.com/bcgov/platform-services-registry/commit/fbb0e11fea20502ad5e1955eeb44f8709f531476))
* **0000:** rebuild canvas via pnpm instead of hardcoded pnpm store path ([0f1ae18](https://github.com/bcgov/platform-services-registry/commit/0f1ae186dafb7baf3941fa7506d41aa2c6b31bee))
* **0000:** reformat code with black 26.1.0 ([7fe9cba](https://github.com/bcgov/platform-services-registry/commit/7fe9cba45118b7eb21bff77f7f913bbec2ab98a4))
* **0000:** remove hardcoded canvas version and rebuild if binary is missing ([a7b9be3](https://github.com/bcgov/platform-services-registry/commit/a7b9be39e6c227ba3bcd54accff24a028ee8e22d))
* **0000:** remove incompatible parser preset ([28eb7ba](https://github.com/bcgov/platform-services-registry/commit/28eb7ba440f328c91cdd3cb19846e03ad3182582))
* **0000:** stop using pnpm approve-builds and rebuild canvas when missing ([9aac2ed](https://github.com/bcgov/platform-services-registry/commit/9aac2ede3e653bf11efcc1268555fb225242f60c))
* **0000:** update onlyBuiltDependencies for app/package,json file ([0103dcf](https://github.com/bcgov/platform-services-registry/commit/0103dcf3ab8eca5fcd21609fb2dd6e8d30fd7dfc))
* **2649:** check if vars are availiable ([d964ea1](https://github.com/bcgov/platform-services-registry/commit/d964ea1dcb8e04ee743077229c0df61f465bb588))
* **2649:** use POST /archive endpoint for prod and test ([eb96e46](https://github.com/bcgov/platform-services-registry/commit/eb96e46b04d30e7163a7316c5cbac9ed3da7faeb))
* **2649:** use POST /archive endpoint for temporary product cleanup ([79e3c47](https://github.com/bcgov/platform-services-registry/commit/79e3c478718e9e5c1888864d00e8d3641284c0af))
## [0.78.5](https://github.com/bcgov/platform-services-registry/compare/v0.78.4...v0.78.5) (2026-01-21)

### Bug Fixes

* **0000:** allow pnpm to build native deps via onlyBuiltDependencies ([55a8eaf](https://github.com/bcgov/platform-services-registry/commit/55a8eaff765fca9d18caba39debffa0c5c2c81b9))
* **0000:** approve native build scripts for pnpm ([87e53b6](https://github.com/bcgov/platform-services-registry/commit/87e53b6c8206dd82b7727aed56d2cc3938bf833c))
* **0000:** correctly detect and rebuild canvas native binary ([fe51d08](https://github.com/bcgov/platform-services-registry/commit/fe51d08f25f4c74a47619171d1fb313325b956ce))
* **0000:** rebuild canvas when canvas.node is missing ([1fd77b7](https://github.com/bcgov/platform-services-registry/commit/1fd77b778afb8f9d81fd9da90c6cf3c180ca14d2))
* **0000:** stop hardcoding canvas pnpm path ([38be713](https://github.com/bcgov/platform-services-registry/commit/38be7137274ad6b7798be230a1167d1654478835))
* **2622:** add replicaSet=replicaset to MongoDB connection string ([14059ea](https://github.com/bcgov/platform-services-registry/commit/14059eae50e053c43ebd6a723e6d2aee826f2589))
* **2624:** increase PostgreSQL resources and disable nano preset ([2984c08](https://github.com/bcgov/platform-services-registry/commit/2984c08fe296df3fb874439cbc741ed09770e54e))
* **2626:** o not use cancelled/rejected requests as baseline for new edits ([985bc93](https://github.com/bcgov/platform-services-registry/commit/985bc93eafbe3dbc0af83be9ac86bca7ed8b2705))
## [0.78.4](https://github.com/bcgov/platform-services-registry/compare/v0.78.3...v0.78.4) (2026-01-09)
## [0.78.3](https://github.com/bcgov/platform-services-registry/compare/v0.78.2...v0.78.3) (2026-01-09)

### Bug Fixes

* **0000:** cleanup unused devDependencies and fix knip config after ESLint migration ([16fc6ed](https://github.com/bcgov/platform-services-registry/commit/16fc6ed1037f9b7facd251bc4194ab6531430f6c))
* **0000:** remove FlatCompat and duplicate plugins to restore ESLint 9 compatibility ([182b53a](https://github.com/bcgov/platform-services-registry/commit/182b53abdae6ffe1eee5b6b067c7ab909b4abc5f))
* **0000:** update pnpm-lock after ESLint devDependency cleanup ([43c1473](https://github.com/bcgov/platform-services-registry/commit/43c14737b0cbc886661baa0c437297e1d01ea0d2))
* **2590:** make safe-faker helper resilient to faker typings ([16b1894](https://github.com/bcgov/platform-services-registry/commit/16b1894a7262abe46c3802e566d62fc3d0b593f5))
* **2590:** marked hotspot as safe ([94c7be1](https://github.com/bcgov/platform-services-registry/commit/94c7be17d5bae6135d18fa954df5c223de823e04))
* **2590:** remove redunadnat commented out line ([33a054d](https://github.com/bcgov/platform-services-registry/commit/33a054dcad830470def79cb8759090cd19b75dca))
* **2590:** replace Math.random with crypto-based RNG to satisfy Sonar security hotspot ([0f9c759](https://github.com/bcgov/platform-services-registry/commit/0f9c7597fc3662103b76b01e9251f1eea04476ad))
* **2590:** revert app/tsconfig.json ([31391f5](https://github.com/bcgov/platform-services-registry/commit/31391f586528465cff30e03bfd7145ff240b3c50))
* **2590:** stabilize initial render by restructuring Html/Head/Body usage ([62320ae](https://github.com/bcgov/platform-services-registry/commit/62320aec2ade9b58e9eb9329b237cf2a58624299))
* **2590:** stabilize react-email previews with safe faker mocks ([c3b3d48](https://github.com/bcgov/platform-services-registry/commit/c3b3d4857c3b58855eb36bae5aa85e93c3eae94f))
* **2590:** update Dockerfile.email to copy new React Email v5 output structure ([3022300](https://github.com/bcgov/platform-services-registry/commit/30223006e56f52fbdef1e73ebb484842a5355bf1))
* **2590:** upgrade react-email preview server to v5 ([5d18e44](https://github.com/bcgov/platform-services-registry/commit/5d18e44dfa4946024a1ac1b70304014915746466))
* **2593:** review icon typings for Tabler v3 compatibility ([4bed257](https://github.com/bcgov/platform-services-registry/commit/4bed2570e495ef9754adc5afcb6759bbd4f9985f))
## [0.78.2](https://github.com/bcgov/platform-services-registry/compare/v0.78.0...v0.78.2) (2025-12-09)

### Bug Fixes

* **1000:** increase pre-db memory ([3e495d7](https://github.com/bcgov/platform-services-registry/commit/3e495d7a5f3c5e2764df877ca44577dad35636c6))
* **2574:** adjust postgres 18 data volume path ([1d90f0b](https://github.com/bcgov/platform-services-registry/commit/1d90f0b7bb1dd88ffdf679082e5211da73e986db))
* **2580:** drop deprecated MongoDB driver options ([abf1107](https://github.com/bcgov/platform-services-registry/commit/abf110798e77d8652487b6b1a3d6a5e7a9992c11))
* **2581:** replace alpine base image with node:22.12.0-slim to resolve Corepack/pnpm failures ([9cacb78](https://github.com/bcgov/platform-services-registry/commit/9cacb78ea0405f3a2b8b2e0798cd6bb225cb8e1f))
* **2585:** patch React via React 19.2.1 & Next 15.4.8 ([18a6d77](https://github.com/bcgov/platform-services-registry/commit/18a6d77a423e7a636eed59fd9712d2f764af769a))
## [0.78.0](https://github.com/bcgov/platform-services-registry/compare/v0.77.0...v0.78.0) (2025-11-24)

### Features

* **5212:** add banner for cost test ([e17c07c](https://github.com/bcgov/platform-services-registry/commit/e17c07cbe8c2ebdb3bf6ebed4c11dd517d152804))
* **6201:** add tabs in task sidebar ([dbd0455](https://github.com/bcgov/platform-services-registry/commit/dbd0455fe7f531295a505acc84f0b63a7260513f))

### Bug Fixes

* **0000:** allow null value in Combobox to resolve type error ([3e3c99c](https://github.com/bcgov/platform-services-registry/commit/3e3c99c0ce53857bbdc840dac2f5e38b325bedfd))
* **0000:** make MongoDB image configurable via IMAGE_MONGODB env var ([2bac638](https://github.com/bcgov/platform-services-registry/commit/2bac63811d8b4837b04bef09baa81b2a4f4a5505))
* **0000:** pin docker/login-action to full commit SHA for security ([137a1ff](https://github.com/bcgov/platform-services-registry/commit/137a1ff4bb044c5cd147c34bf76237903f2614fb))
* **0000:** reverse .github/workflows/test.yml ([3e18451](https://github.com/bcgov/platform-services-registry/commit/3e18451eda7d67aa4c93f163803cc7073829fdec))
* **0000:** upgrade to Chart.js v4.5.1 and fix typings, plugin registration, and null handling ([ff80ba6](https://github.com/bcgov/platform-services-registry/commit/ff80ba6612d41ff483e435e36419deefe53ebc40))
* **0000:** use GHCR MongoDB image and add registry login for test workflow ([971abf4](https://github.com/bcgov/platform-services-registry/commit/971abf41123645ac869ba25b05fc387a8e0adbcf))
## [0.77.0](https://github.com/bcgov/platform-services-registry/compare/v0.76.0...v0.77.0) (2025-09-05)

### Features

* **6415:** implement Github action for MongoDB image build ([2dd75a3](https://github.com/bcgov/platform-services-registry/commit/2dd75a3ccd40bedf68e03d619e8974103d65faef))
* **6415:** use custom Bitnami images for MongoDB ([27345e3](https://github.com/bcgov/platform-services-registry/commit/27345e3321a74095928d47f10bc1d0151ab4fd0c))

### Docs

* **6415:** include research on Bitnami image deprecation ([a95ccc7](https://github.com/bcgov/platform-services-registry/commit/a95ccc71646eae1d406f701ec94fd704cd948581))
## [0.76.0](https://github.com/bcgov/platform-services-registry/compare/v0.75.0...v0.76.0) (2025-08-28)

### Features

* **6023:** implement server-compatible table component ([fa60d6f](https://github.com/bcgov/platform-services-registry/commit/fa60d6f9ba4c2ba46d77584abd649dda2051c5ef))
* **6026:** delete Terraform files for ministry roles ([1b9ba78](https://github.com/bcgov/platform-services-registry/commit/1b9ba78db409f637108f1c900b67f951a52f280e))
* **6026:** integrate dynamic organizations with app ([711ac63](https://github.com/bcgov/platform-services-registry/commit/711ac63bae7f3828177e97403d13a9788b2a5b86))
* **6026:** migrate data on organization deletion ([e9bb201](https://github.com/bcgov/platform-services-registry/commit/e9bb2012981ba6016a9d197754da2e741b8a74e9))
* **6026:** migrate data on organization deletion ([0bc45d8](https://github.com/bcgov/platform-services-registry/commit/0bc45d8a2c5526ae85872e754a1435a944a50cd9))
* **6026:** reflectively update organization in Keycloak ([4ac5935](https://github.com/bcgov/platform-services-registry/commit/4ac5935a2e8782f536dc8baaa192409e105cef4e))
* **6026:** set AG ministry flags dynamically in orgs ([97d1974](https://github.com/bcgov/platform-services-registry/commit/97d197446e2846654b298efeacd5c09f8fe7653d))
* **6026:** update DB schema and backend logic related to organizations ([7135e36](https://github.com/bcgov/platform-services-registry/commit/7135e3662d5ff92b804f42a9a9f6d989464be720))
* **6087:** restrict submitting Additional Team Members without roles ([f19a473](https://github.com/bcgov/platform-services-registry/commit/f19a47353bd5809823c7f55eb652873bd926f6ff))
* **6115:** improve event service design pattern ([b9c1875](https://github.com/bcgov/platform-services-registry/commit/b9c18759f8b677d9ef34e6bc8aaa4c652a48949f))
* **6143:** restrict adding same users within Additional Team Members ([5264870](https://github.com/bcgov/platform-services-registry/commit/5264870c3c7e10deaa03a07080626040f6ff64c2))
* **6152:** show 'projected' badges in cost table ([f849be8](https://github.com/bcgov/platform-services-registry/commit/f849be8e647e73b2ab692c709ace96503f10187c))
* **6314:** update ministries ([77f308e](https://github.com/bcgov/platform-services-registry/commit/77f308e39590870dda8e83432af12159fcb6f854))
* **6331:** add deleted no idirGuid users functionality ([4ab4e62](https://github.com/bcgov/platform-services-registry/commit/4ab4e62be0d64682849a0160f864fd8553205532))
* **6353:** add DB backup during each deployment ([abaf2f0](https://github.com/bcgov/platform-services-registry/commit/abaf2f0e459020f6740ff5606311b98068ac4e80))

### Bug Fixes

* **6152:** correct cost rendering on initial request page ([85f4c24](https://github.com/bcgov/platform-services-registry/commit/85f4c241deeefa68f867dd9d6ba950dfba3cb6e9))

### Docs

* **6199:** add documentation on e2e tests ([4c3994b](https://github.com/bcgov/platform-services-registry/commit/4c3994be9a111d18603fba09f936272de1b8aad3))

### Refactors

* **6023:** update PDF tables to use generic table ([0fffa6a](https://github.com/bcgov/platform-services-registry/commit/0fffa6a74e402573e402327ee174ccb405f6dd05))
* **6114:** enhance task service design pattern ([e460eab](https://github.com/bcgov/platform-services-registry/commit/e460eab198ebda6c2b37623ad819b799d1e83caf))
* **6248:** migrate dependency to keycloak/keycloak ([6943622](https://github.com/bcgov/platform-services-registry/commit/6943622884551071c2df2888952f25a878079548))

### End-to-end Testing

* **5594:** fix e2e tests, uniqualize names for parallel run ([b734714](https://github.com/bcgov/platform-services-registry/commit/b7347149e3fec53e4ec3c3be7d8878e7c19319ac))
* **6209:** fix e2e tests ([9e768b2](https://github.com/bcgov/platform-services-registry/commit/9e768b2d1f839fe8ddb0ec112c1268f57649123c))
## [0.75.0](https://github.com/bcgov/platform-services-registry/compare/v0.74.2...v0.75.0) (2025-08-05)

### Features

* **6155:** display tooltip for forecast calculation ([0379118](https://github.com/bcgov/platform-services-registry/commit/037911899e250c7c50714fc9f26429f6a95a69af))
## [0.74.2](https://github.com/bcgov/platform-services-registry/compare/v0.74.1...v0.74.2) (2025-08-05)

### Bug Fixes

* **000:** resolve issue with ID queries ([718e600](https://github.com/bcgov/platform-services-registry/commit/718e600258f7d2155accd0dff7b89e861359c536))

### Refactors

* **6153:** reorganize cost component structure ([3154957](https://github.com/bcgov/platform-services-registry/commit/3154957b0743dbef133717a16522fa2441972192))
* **6168:** calculate quota proportionally in time ([001ea70](https://github.com/bcgov/platform-services-registry/commit/001ea70d7ecbc229bc5addd4f149e0936d9dd2a5))
## [0.74.1](https://github.com/bcgov/platform-services-registry/compare/v0.74.0...v0.74.1) (2025-07-31)

### Bug Fixes

* **6202:** handle querying requests by requester IDs ([647b751](https://github.com/bcgov/platform-services-registry/commit/647b7512ec58abbeec244933d995cd06c227f8ae))
## [0.74.0](https://github.com/bcgov/platform-services-registry/compare/v0.73.1...v0.74.0) (2025-07-30)

### Features

* **5812:** implement reminders for private cloud reviews ([c37b91d](https://github.com/bcgov/platform-services-registry/commit/c37b91d44c17f6434c86453d0137539e75e28603))
* **5915:** rename createdByEmail and decisionMakerEmail to createdById and decisionMakerId ([39830a8](https://github.com/bcgov/platform-services-registry/commit/39830a820debc26eeae60e502c5b65e8911dde8b))
* **6006:** implement migration script for ministries ([2578079](https://github.com/bcgov/platform-services-registry/commit/25780795aca6cb36bf91fe5191adbba329781127))
* **6006:** implement UI pages for organization ([9dd1e14](https://github.com/bcgov/platform-services-registry/commit/9dd1e14cc1117da93ef5f1c6a3c3a77f88b55260))
* **6027:** add start button, statrted status and user info to tasks sidebar ([83d185d](https://github.com/bcgov/platform-services-registry/commit/83d185d10abef8cbce9e83419bb6f71147001134))
* **6028:** display distinct labels for actioned requests ([0b08f8a](https://github.com/bcgov/platform-services-registry/commit/0b08f8a0a7dfc0cd5742feab4b9a5481307dbc5e))

### Bug Fixes

* **0000:** remove deprecated ministries ([3c429e5](https://github.com/bcgov/platform-services-registry/commit/3c429e523828e35730a0a0653cdbecdf2f61615e))

### Refactors

* **6168:** improve team API accounts page ([2d03fa0](https://github.com/bcgov/platform-services-registry/commit/2d03fa00cd7bc535dbccb4b9c54a628a1f2a8cb6))
* **6168:** limit IDIR provider searched users by roles ([87ef3f9](https://github.com/bcgov/platform-services-registry/commit/87ef3f98786aa645018e9673cdb6ebf32f291f82))
* **6168:** simplify cost page calculation logic ([a0a05da](https://github.com/bcgov/platform-services-registry/commit/a0a05dae2f93d1be897d0c324713718a215f9434))
## [0.73.1](https://github.com/bcgov/platform-services-registry/compare/v0.73.0...v0.73.1) (2025-07-21)

### Bug Fixes

* **6006:** resolve rendering issues in client page generator ([5520b78](https://github.com/bcgov/platform-services-registry/commit/5520b78029ed7daeb74b9e0e6c97f3ce06573241))
## [0.73.0](https://github.com/bcgov/platform-services-registry/compare/v0.72.0...v0.73.0) (2025-07-21)

### Features

* **2598:** add api endpoint with contacts/members changes ([ce54287](https://github.com/bcgov/platform-services-registry/commit/ce54287c8e9b5e5c11bcc0ce5dd0f6a6c4717937))
* **5795:** add pdf dowloader to new cost pages ([3d9dc8e](https://github.com/bcgov/platform-services-registry/commit/3d9dc8ebbf7795c310843f01ff426fbfa61af1d9))
* **5974:** upgrade tailwind to v4 ([e8e6574](https://github.com/bcgov/platform-services-registry/commit/e8e6574507bfe06c04181245cf31ee09694de831))
* **6003:** access Graph API via certificates ([64b85de](https://github.com/bcgov/platform-services-registry/commit/64b85de4bd65e9e5db0c0e230315b3329d04ffa3))
* **6003:** set default arguments in Airflow DAGs ([bca734b](https://github.com/bcgov/platform-services-registry/commit/bca734b3125477d897c52694185867b57c9c002c))
* **6003:** verify certificate for token checks ([5076120](https://github.com/bcgov/platform-services-registry/commit/50761208190e969580d574b855e3bca4b60ef72e))
* **6005:** migrate HMA ministry records ([cc61a1d](https://github.com/bcgov/platform-services-registry/commit/cc61a1da20557f961a36f686a9a92a779d9c1554))
* **6006:** add organization schema with APIs ([eda2bb8](https://github.com/bcgov/platform-services-registry/commit/eda2bb842b494782f40c05881d15180655134655))

### Bug Fixes

* **0000:** initialize pathParams, queryParams, and body with schema.parse defaults ([3da0afc](https://github.com/bcgov/platform-services-registry/commit/3da0afc7cedc32e11968248355809b52da0b0bb5))
* **6042:** assert schema.parse output types to satisfy Zod v4 typings ([d619ce5](https://github.com/bcgov/platform-services-registry/commit/d619ce59a068c6cef621c9fd9f5b12fc2cf150f2))
* **6042:** ensure default param return matches output<T> to fix Record<string, never> error ([458a1cf](https://github.com/bcgov/platform-services-registry/commit/458a1cf1ee8e35fb131a92e072591d093cee69d2))
* **6042:** ensure getPathParams and getQueryParams return valid types or throw on failure ([e6ab320](https://github.com/bcgov/platform-services-registry/commit/e6ab320964730e8040a2d4c0a89cf54866d85bb6))
* **6042:** ensure getQueryParams returns valid type or throws to satisfy strict output<T> typing ([540697f](https://github.com/bcgov/platform-services-registry/commit/540697f676a0762cdf13b039d36c0dad77a35825))
* **6042:** ensure type-safe validation for path, query, and body using Zod v4 ([36e8b0c](https://github.com/bcgov/platform-services-registry/commit/36e8b0c70735186fc582854011850c03fc120f4b))
* **6058:** add hardcoded LP and cluster for local at getUsageMetrics ([57564f2](https://github.com/bcgov/platform-services-registry/commit/57564f26bc783762d15d5efc1f8e62f668e5a541))
* **6058:** add hardcoded LP and cluster for local getQuotaChangeStatus ([894e3a4](https://github.com/bcgov/platform-services-registry/commit/894e3a47438176bd344028730b2586169ec646af))
## [0.72.0](https://github.com/bcgov/platform-services-registry/compare/v0.71.0...v0.72.0) (2025-07-09)

### Features

* **4778:** add sorry cypress deployment ([90db860](https://github.com/bcgov/platform-services-registry/commit/90db8606b11e678786565cc459994618fd8d851a))
* **4778:** deployment of mongodb in tools namespace ([e649b31](https://github.com/bcgov/platform-services-registry/commit/e649b318ff884611be1cc7f9bbff5f319753abe8))
* **5856:** replace cost tables with table cc ([7c4683b](https://github.com/bcgov/platform-services-registry/commit/7c4683b38f719ee005a1d939a1f830b5c7e4d70e))
* **5878:** enhance cost estimation table UI ([0054077](https://github.com/bcgov/platform-services-registry/commit/0054077bca28e8e3e9098103bbc5d20c752c7211))
* **5879:** investigate retrieval of cluster-level resource status on OpenShift ([65ffeb6](https://github.com/bcgov/platform-services-registry/commit/65ffeb66bea11bb22454c245d5781eee5c6085bf))
* **5934:** add shellcheck local script ([f774012](https://github.com/bcgov/platform-services-registry/commit/f774012c43cd335516136b08fb5c85e1175efeee))
* **5934:** integration kube-linter in CI checks ([7223f90](https://github.com/bcgov/platform-services-registry/commit/7223f90f01e7b7d6f506c2c55c690904d6225463))
* **5948:** revisit sync-changes API for public and private clouds ([1abdae5](https://github.com/bcgov/platform-services-registry/commit/1abdae5099bcdcdd52a8689417ebfc40d082cfa9))
* **5957:** discretize resource values for new design ([fae58b2](https://github.com/bcgov/platform-services-registry/commit/fae58b21ab27a27cab44d23dfdb1fa4cfaecea3e))
* **5957:** redesign cost pages ([d82d622](https://github.com/bcgov/platform-services-registry/commit/d82d6225ae9d97d34269f192302f003ea7cf89ef))
* **5957:** update cc table and cost charts for new design ([a70d8c2](https://github.com/bcgov/platform-services-registry/commit/a70d8c27ffc4ebde0a58cf3b71ebd45bb75a9aa1))
* **5970:** replace client secret with certificate for Microsoft graph API ([7b3c9eb](https://github.com/bcgov/platform-services-registry/commit/7b3c9eb9fc05045c09c37e55d05ea421057056c7))

### Refactors

* **5820:** deprecate @tremor/react ([16fd1fc](https://github.com/bcgov/platform-services-registry/commit/16fd1fc0b0c08b7020daef4ae4c127e1d5ae61f7))
* **5845:** clean up environment variables about MS graph ([25508d1](https://github.com/bcgov/platform-services-registry/commit/25508d159d8e1646be59090f5ed0c8728fa477c0))
* **5845:** update MS graph API services using Axios configs ([8de3e1b](https://github.com/bcgov/platform-services-registry/commit/8de3e1b793cbe0856e3cc955954fffdc1939416b))
## [0.71.0](https://github.com/bcgov/platform-services-registry/compare/v0.70.0...v0.71.0) (2025-06-26)

### Features

* **4877:** exclude non-business days in decision charts ([4db3378](https://github.com/bcgov/platform-services-registry/commit/4db337849f10ce87cf9e49ffd00c29a90b7f5061))
* **5737:** support email delivery in Airflow dev setup ([9bbd05b](https://github.com/bcgov/platform-services-registry/commit/9bbd05b562d054e53b7af2597715a6024035ac22))
* **5758:** add remote logging support for Airflow tasks ([56326b2](https://github.com/bcgov/platform-services-registry/commit/56326b238373f4dae2db33e258b0372b0b9c90c7))
* **5856:** design table attributes ([65bdeba](https://github.com/bcgov/platform-services-registry/commit/65bdeba006663e1a4ed238fd59de7090a0708f74))
* **5856:** replace team api account table with cc table ([5bb3f5f](https://github.com/bcgov/platform-services-registry/commit/5bb3f5f01bbde0f71eb65a31176e5df5dfe6b056))
* **5877:** consolidate team and additional team members sections ([30b42f8](https://github.com/bcgov/platform-services-registry/commit/30b42f8e4faae47bf756c27576f95c8d9bad9c9a))
* **5901:** verify successful email delivery via CHES ([50a041c](https://github.com/bcgov/platform-services-registry/commit/50a041c611ad6ab642c454e84940d4ab81f07811))
* **5912:** add team members emails for edit request public and private ([fa03a73](https://github.com/bcgov/platform-services-registry/commit/fa03a735ca8905a489a35cc2b4aeb5b38f739c24))
* **5930:** add migration script to replace broken EA ids with Po ids ([ea62e30](https://github.com/bcgov/platform-services-registry/commit/ea62e30761d1cbfcfbd54fa52f7416ce0a709d55))
* **5940:** display human-readable dates on analytics pages ([fb36b89](https://github.com/bcgov/platform-services-registry/commit/fb36b891ec7ad47ac39b8de1eb5328ed6f1fd8a1))

### Bug Fixes

* **5950:** resolve new Airflow Helm config issue ([6f38b1b](https://github.com/bcgov/platform-services-registry/commit/6f38b1bd7b0f5ea804183d0e9cad9eeeb8e2bdd4))

### Docs

* **5393:** add documentation on research into IDIR's source of truth ([a850bac](https://github.com/bcgov/platform-services-registry/commit/a850bacfb55bc4a59c20d6fb9e15b21d55e0d01b))

### Refactors

* **5900:** switch from fetch to axios for HTTP requests ([3f1cbe4](https://github.com/bcgov/platform-services-registry/commit/3f1cbe421e34dd0f902af96710c1036219ca4d18))
## [0.70.0](https://github.com/bcgov/platform-services-registry/compare/v0.69.0...v0.70.0) (2025-06-18)

### Features

* **5782:** add minio deployment via helm ([acea0e9](https://github.com/bcgov/platform-services-registry/commit/acea0e91c8d5f63934b183ae54addffc4fa56b1d))

### Bug Fixes

* **5881:** remove Gold DR cluster from creation UI ([faec6fd](https://github.com/bcgov/platform-services-registry/commit/faec6fd770686c17b3bc155d11060c184b4d3e53))
## [0.69.0](https://github.com/bcgov/platform-services-registry/compare/v0.68.0...v0.69.0) (2025-06-17)

### Features

* **5574:** add table common component ([78e241f](https://github.com/bcgov/platform-services-registry/commit/78e241fc3102275e92021b5c3f957f2dc3178818))
* **5621:** add public plat admin authority to cancel requests ([4e595b6](https://github.com/bcgov/platform-services-registry/commit/4e595b635cedccd7d0e3dd8de0992b2569f78f74))
* **5765:** add view permission for public request page ([a043461](https://github.com/bcgov/platform-services-registry/commit/a0434615e3b4f063833aad50c174f7cbb6e9f5f3))
* **5765:** show eMou status in cloud request details ([4d7490c](https://github.com/bcgov/platform-services-registry/commit/4d7490cef699c8125364977804be5c7d39cec86e))
* **5857:** add NATs message attribute for Golddr flag ([e130b93](https://github.com/bcgov/platform-services-registry/commit/e130b93819a4d714800e7719acdc731ef4cfc704))
* **5861:** make AWS LZA avaliable for regular users on create page ([8941776](https://github.com/bcgov/platform-services-registry/commit/8941776bceac2583b2727d9fc1d95deb06a136f0))
## [0.68.0](https://github.com/bcgov/platform-services-registry/compare/v0.67.0...v0.68.0) (2025-06-16)

### Features

* **5601:** enhance cost computation to account for archival date ([5e8d214](https://github.com/bcgov/platform-services-registry/commit/5e8d214e1ab00438557ea8da1327300c769408de))
* **5720:** add endpoint to retrieve public cloud billings ([aff60a0](https://github.com/bcgov/platform-services-registry/commit/aff60a03e27dc85be4b3653e1ddda7783f646cad))
* **5720:** add new history view on public cloud requests ([7775666](https://github.com/bcgov/platform-services-registry/commit/7775666f74692340c3daa8dc535c61ea9a34c7f7))
* **5720:** update history view on private cloud requests ([4ea435f](https://github.com/bcgov/platform-services-registry/commit/4ea435fce16938e137e93eec3c22f55a0d9d8327))
* **5736:** encapsulate shared chart logic into common components ([77f9ab5](https://github.com/bcgov/platform-services-registry/commit/77f9ab52008e365e9ccde95b873f4d56cc3d5f68))
* **5736:** replace area graph implementation with Chart.js ([862a6ad](https://github.com/bcgov/platform-services-registry/commit/862a6adf2d01c42a216d740b8a59ac607e9e37f5))
* **5736:** replace barchart implementation with Chart.js ([e53fda0](https://github.com/bcgov/platform-services-registry/commit/e53fda0bbd0be2c7c724e2a1dfe30abaa24f0336))
* **5736:** replace dounut chart implementation with Chart.js ([e604fcf](https://github.com/bcgov/platform-services-registry/commit/e604fcf5a6e656154c8325da04413772a55f5055))
* **5782:** add minio chart ([edd301c](https://github.com/bcgov/platform-services-registry/commit/edd301c3e4da61afbef499c52bdf898d4745e0e7))
* **5797:** enhance visibility of GoldDR clusters ([2b8ec88](https://github.com/bcgov/platform-services-registry/commit/2b8ec882c92cac61f1b801a69fdc22ba4dfc174a))
* **5811:** update Airflow DAGs failure callback ([f6b6519](https://github.com/bcgov/platform-services-registry/commit/f6b651958eaa13adbec972128693028e472533f5))

### Refactors

* **2938:** address SonarQube medium warnings ([6662061](https://github.com/bcgov/platform-services-registry/commit/6662061ab78c2afdbd69ac808648a635bfc67da3))
* **2938:** address SonarQube medium warnings cont' ([42303ee](https://github.com/bcgov/platform-services-registry/commit/42303ee10cc174f4953038c789b937bd66f0130b))
* **5798:** deprecate @azure/msal-node, @azure/identity ([8168feb](https://github.com/bcgov/platform-services-registry/commit/8168febb891ba8b56246e3148f08d06cb401abf5))
## [0.67.0](https://github.com/bcgov/platform-services-registry/compare/v0.66.0...v0.67.0) (2025-06-04)

### Features

* **5573:** upgrade Airflow version ([9491c93](https://github.com/bcgov/platform-services-registry/commit/9491c933da6b45e02e51bb5761562b1d8377ee44))
* **5620:** update language about Azure project set ([bcd0254](https://github.com/bcgov/platform-services-registry/commit/bcd02541ac7a1ebdd77393862578ab673671f4b3))
* **5659:** add a script to check m365 client flow ([8d56234](https://github.com/bcgov/platform-services-registry/commit/8d562340e1213dae190eda44aabd51e85cb309cf))
* **5687:** improve the cost estimation section ([839bd3d](https://github.com/bcgov/platform-services-registry/commit/839bd3ddfdc5096023975d1cfee070ffa407f801))

### Bug Fixes

* **5714:** make cost charts responsive ([c403670](https://github.com/bcgov/platform-services-registry/commit/c403670b6fa10654d4b9ecec09c0444f9ab31b88))
* **5746:** install missing airflow deps in v3 ([33d1732](https://github.com/bcgov/platform-services-registry/commit/33d1732e777cf5f6564e362ec2e69bd4b5999d70))

### Refactors

* **2938:** address SonarQube security warnings ([c93de84](https://github.com/bcgov/platform-services-registry/commit/c93de84ebcf8ea8c6016e1cafdf1c5ca15971221))
* **2938:** address SonarQube warnings cont' ([e66f7f9](https://github.com/bcgov/platform-services-registry/commit/e66f7f983cec5ffb10ebb765d89e9c90e886aeed))
* **5746:** update Airflow codebase for compatibility with v3 ([522b136](https://github.com/bcgov/platform-services-registry/commit/522b13647acbab3559013439890c6fcf149bd9b0))
## [0.66.0](https://github.com/bcgov/platform-services-registry/compare/v0.65.1...v0.66.0) (2025-05-27)

### Features

* **2224:** rename ministry EMBC to EMCR ([392a4c5](https://github.com/bcgov/platform-services-registry/commit/392a4c56bccd0b22dbcb3700fe1c64d79cb2b7db))
* **5600:** display projected values for yearly cost page ([29bbc68](https://github.com/bcgov/platform-services-registry/commit/29bbc68ad098f385e9e7495341f2443676fa0f27))
* **5654:** allow project team access history tab ([1e91f74](https://github.com/bcgov/platform-services-registry/commit/1e91f74982d37ce7f691bb6af995ecef84f0fd11))
* **5654:** redesign history view ([8a82ddd](https://github.com/bcgov/platform-services-registry/commit/8a82dddf705fbda3e81372718f69942af8809297))
* **5689:** update Sysdig Terraform package version ([c4a337e](https://github.com/bcgov/platform-services-registry/commit/c4a337e401cbc28738e394188188920acf905119))

### Bug Fixes

* **5702:** ensure token string is passed for prometheus auth ([e02e843](https://github.com/bcgov/platform-services-registry/commit/e02e8436ec454bea853f74698a4e5012b25e22f6))

### Refactors

* **5312:** improve the resource usage page ([b468bb8](https://github.com/bcgov/platform-services-registry/commit/b468bb8cb12e73a7925fb2589a958b8faf23f10b))
* **5472:** enforce strict types in private cloud codebase ([bee6fe1](https://github.com/bcgov/platform-services-registry/commit/bee6fe1cba6fe7865e1ed639ae72e0cea1e752c1))
* **5472:** enforce strict types in public cloud test codebase ([b2f0593](https://github.com/bcgov/platform-services-registry/commit/b2f05930e444b3b138ef1ac014004caedcfc7d54))
## [0.65.1](https://github.com/bcgov/platform-services-registry/compare/v0.65.0...v0.65.1) (2025-05-22)

### Bug Fixes

* **5677:** extract baseCommentSchema to share between required and optional comment rules ([db11623](https://github.com/bcgov/platform-services-registry/commit/db11623d08193a9f310b2a41b717a5ceee0da0ef))
* **5677:** use separate delete request bodySchema for reject and approve ([599c4dc](https://github.com/bcgov/platform-services-registry/commit/599c4dc1f250d7ca029b36504ec1849794cbcc3a))
## [0.65.0](https://github.com/bcgov/platform-services-registry/compare/v0.64.0...v0.65.0) (2025-05-21)

### Features

* **5319:** identify dangling namespaces in the dev environment ([92e4b8e](https://github.com/bcgov/platform-services-registry/commit/92e4b8ef6ed7a5276ca1eee9c087751ddd6cc748))
* **5387:** add admin page for private cloud bills mgt ([e3012df](https://github.com/bcgov/platform-services-registry/commit/e3012dfc67df503dce10e2765c2dba5b61b854d0))
* **5475:** confirm unit price update or addition for past dates ([f2690fa](https://github.com/bcgov/platform-services-registry/commit/f2690fa93f330d202ddd00984a090a7e6ea941a2))
* **5499:** upload DB buacks to OCIO S3 bucket ([5163460](https://github.com/bcgov/platform-services-registry/commit/51634603eaf0a0e958a0210316fd732cc5ed28e1))
* **5526:** add reason for delete field to public and private cloud deletion modal and emails ([343ee4e](https://github.com/bcgov/platform-services-registry/commit/343ee4ea4d11cd10ffe4d43296a94c2bf6792d14))
* **5592:** disable Sysdig alerts ([4009a22](https://github.com/bcgov/platform-services-registry/commit/4009a221c5cdc3626fa65220c89d59c642185be3))
* **5609:** add backend API endpoint for quarterly costs page ([7257be7](https://github.com/bcgov/platform-services-registry/commit/7257be742a5707dd9b5433ea1a294e532560dee3))
* **5609:** add frontend page for quarterly costs ([0449d12](https://github.com/bcgov/platform-services-registry/commit/0449d1238c8eb05f25ca5185ae861b09e2e9d335))
* **5637:** save Cypress dashboard data to local files ([fdb38fd](https://github.com/bcgov/platform-services-registry/commit/fdb38fd28557bb20b668092340a200a7545d72ee))
* **5648:** add toggle for list & history views in requests tab ([b164a85](https://github.com/bcgov/platform-services-registry/commit/b164a857eadb5f7aa720fe261020b3450525efeb))
* **5648:** consolidate private cloud product cost pages ([9e362a1](https://github.com/bcgov/platform-services-registry/commit/9e362a17987e1bb55ee95f5cb2c9858c987ae122))
* **5673:** double CPU and storage if golddrEnabled is true on GOLD cluster ([e14f709](https://github.com/bcgov/platform-services-registry/commit/e14f7098693b08da35cfa174379b402bed1f91ff))
## [0.64.0](https://github.com/bcgov/platform-services-registry/compare/v0.63.0...v0.64.0) (2025-05-05)

### Features

* **5383:** add monthly cost product page ([6d1245c](https://github.com/bcgov/platform-services-registry/commit/6d1245c3ed37d0621f3d71ab8ba45ba360f45bd6))
* **5383:** generate chart images backend for PDF download ([e345ad2](https://github.com/bcgov/platform-services-registry/commit/e345ad2dc17082ac660ee66406d3ca1d631fa914))
* **5383:** generate PDF with shared components ([ee21d54](https://github.com/bcgov/platform-services-registry/commit/ee21d54654b02fb5d89298269d27e9ecaf6458d2))
* **5386:** add custom year picker common component ([1d055d6](https://github.com/bcgov/platform-services-registry/commit/1d055d6afe1684975635b3f9f2a40a650709979e))
* **5386:** generate cost history page for a given year ([f23c5f4](https://github.com/bcgov/platform-services-registry/commit/f23c5f406fda1e062bc21d7b78e475295d3df414))
* **5386:** implement PDF download for yearly cost ([6b2e975](https://github.com/bcgov/platform-services-registry/commit/6b2e9755dc10f08c9a396dfeaa352052abe812e1))
* **5575:** enable Azure option in production ([3d38c20](https://github.com/bcgov/platform-services-registry/commit/3d38c209a764e235a7730e5bd9dc2bc16824f7c3))

### Bug Fixes

* **5575:** add retry with delay for Mailchimp email update errors ([db2c75c](https://github.com/bcgov/platform-services-registry/commit/db2c75cb7546ff316992145d9849791191017177))
## [0.63.0](https://github.com/bcgov/platform-services-registry/compare/v0.62.1...v0.63.0) (2025-04-29)

### Features

* **5384:** add private-cloud cost endpoints ([a5821b3](https://github.com/bcgov/platform-services-registry/commit/a5821b3656a065f8b7703ca9e3a6b3d80d023315))
* **5417:** store prisma types in codebase ([99e464b](https://github.com/bcgov/platform-services-registry/commit/99e464b1773f9f1ccadc800667d45e6bb3168a0d))
* **5473:** make expenseAuthorityId field mandatory ([74c8422](https://github.com/bcgov/platform-services-registry/commit/74c84225361f80f7f73fd5118ec6c18247bc05d5))
* **5533:** display active request alert on public cloud product ([6ada78b](https://github.com/bcgov/platform-services-registry/commit/6ada78bfe3ed51eb7d2fa1fad624ce4c7dd13198))

### Bug Fixes

* **5511:** fix prisma client error in dev env ([46846db](https://github.com/bcgov/platform-services-registry/commit/46846dbc66afa42ecd2cf89bba66e73f190b68ae))

### Docs

* **1095:** add documentation for Apache Airflow ([b93b1d0](https://github.com/bcgov/platform-services-registry/commit/b93b1d06e485b65afae2ff35cb3f37b771134bc7))
* **1095:** add Gold cluster migration research ([0b90226](https://github.com/bcgov/platform-services-registry/commit/0b90226de104403b4f52123c6c32f66d8abae0a8))
* **1095:** add roles and permissions system ([2fbba42](https://github.com/bcgov/platform-services-registry/commit/2fbba42ba42fcfe947df7e91da6f0d3113d9d2ea))
* **1095:** document request workflows ([01d3168](https://github.com/bcgov/platform-services-registry/commit/01d3168e546763b100ab7865b5ec6a27c12046de))
* **1095:** document user and team service account types and usage ([302fa50](https://github.com/bcgov/platform-services-registry/commit/302fa50d94dcc8d4073adb4b10d9bb5ad78f06d1))
## [0.62.1](https://github.com/bcgov/platform-services-registry/compare/v0.62.0...v0.62.1) (2025-04-25)

### Bug Fixes

* **5510:** exclude request comments from decision data ([fb08deb](https://github.com/bcgov/platform-services-registry/commit/fb08deb718d65d8e6b69c509211931ec86ae03bd))
## [0.62.0](https://github.com/bcgov/platform-services-registry/compare/v0.61.0...v0.62.0) (2025-04-22)

### Features

* **5343:** redirect anauthorized user to original url after login ([194ad5b](https://github.com/bcgov/platform-services-registry/commit/194ad5be4fc8e8e6c90b39fb991071bcb9b8a081))
* **5382:** implement backend support for Private Cloud unit price page ([20a2dc4](https://github.com/bcgov/platform-services-registry/commit/20a2dc4be472a3e2a33797ae72bb237d6de1127a))
* **5382:** implement frontend page for Private Cloud unit price page ([bb939a4](https://github.com/bcgov/platform-services-registry/commit/bb939a44ec3e5a25ddf208f5e11a6b69bbc9d11d))
* **5421:** enforce eslint rule to check unused imports ([d5b0940](https://github.com/bcgov/platform-services-registry/commit/d5b09405d28891d965f65a9af353fe65e72a3b37))

### Docs

* **5424:** add clean code contents ([9adcf38](https://github.com/bcgov/platform-services-registry/commit/9adcf3885ff657c669331a59c6630f7ff88f0690))
* **5424:** add data communication workflow ([68a0abf](https://github.com/bcgov/platform-services-registry/commit/68a0abf0f0d53fe24d4634a3a3861454f41c6415))
* **5424:** add mermaid plugin for Mkdocs ([e04d9c2](https://github.com/bcgov/platform-services-registry/commit/e04d9c29759bcce24a351432c17c9f80dc17b8f6))
* **5424:** update development setup ([f6b0fd9](https://github.com/bcgov/platform-services-registry/commit/f6b0fd98d969bb916eb509b3daeb30fe20232459))
* **5425:** re-organize exisiting contents ([5b47ade](https://github.com/bcgov/platform-services-registry/commit/5b47ade9facf8d5cac279ec50d65d406e1434f16))
* **5425:** re-organize exisiting contents cont' ([99b10d4](https://github.com/bcgov/platform-services-registry/commit/99b10d42d15e6009c163746aeb41d52eb2d00de7))
## [0.61.0](https://github.com/bcgov/platform-services-registry/compare/v0.60.0...v0.61.0) (2025-04-10)

### Features

* **5123:** make billing account coding editable for EA ([92d2888](https://github.com/bcgov/platform-services-registry/commit/92d2888963ee07a14e49b4b7d81fd132ecdfc676))
* **5124:** sync registry users with azure ad ([04e0b62](https://github.com/bcgov/platform-services-registry/commit/04e0b62b14de823525a3a03c2047903309eceea9))

### Bug Fixes

* **5124:** fix import aiflow import errors ([4b969fd](https://github.com/bcgov/platform-services-registry/commit/4b969fd42c5bd9b84533abde4d5a76d7b1a18b60))
## [0.60.0](https://github.com/bcgov/platform-services-registry/compare/v0.59.0...v0.60.0) (2025-04-09)

### Refactors

* **5235:** encapsulate logic for cluster config generation ([ece279e](https://github.com/bcgov/platform-services-registry/commit/ece279ec4784ae169073627d8d046b774f9b9e67))
* **5235:** use k8s package to check deletion availability ([ba22722](https://github.com/bcgov/platform-services-registry/commit/ba2272245316dcccde549efb1e70cdc093ee914a))

### End-to-end Testing

* **5314:** add public cloud edit request compare data test ([62b6fca](https://github.com/bcgov/platform-services-registry/commit/62b6fca371d77af5717f54a9f618f76fb6b40327))
## [0.59.0](https://github.com/bcgov/platform-services-registry/compare/v0.58.0...v0.59.0) (2025-04-02)

### Features

* **5350:** add billing status filter to public cloud list page ([1ca9d86](https://github.com/bcgov/platform-services-registry/commit/1ca9d86ccdadd8b1b4520fe91db435e0a4f6fcb4))
## [0.58.0](https://github.com/bcgov/platform-services-registry/compare/v0.57.0...v0.58.0) (2025-04-02)

### Features

* **5357:** add data migration to create missing billings ([ff99265](https://github.com/bcgov/platform-services-registry/commit/ff99265b0a0b43e777ab542b9b18bf6e59242a32))
## [0.57.0](https://github.com/bcgov/platform-services-registry/compare/v0.56.0...v0.57.0) (2025-04-02)

### Features

* **5357:** send NATs message when eMOU completed ([c01fd24](https://github.com/bcgov/platform-services-registry/commit/c01fd24622928d12b2177373162f1e05ce56f326))

### Bug Fixes

* **5355:** remove logic to set default value on edit page ([a43488b](https://github.com/bcgov/platform-services-registry/commit/a43488be57af9132df51911009159b23eb2889af))
## [0.56.0](https://github.com/bcgov/platform-services-registry/compare/v0.55.0...v0.56.0) (2025-04-01)

### Features

* **5285:** add cost estimation on Quota section ([9acfb52](https://github.com/bcgov/platform-services-registry/commit/9acfb528b3d0f5d3e5683998a45a23eacf8d7133))

### Bug Fixes

* **0000:** add provision client credentials on nats-provision ([5abe34c](https://github.com/bcgov/platform-services-registry/commit/5abe34cd94ae9db1d1ad487c4108347044f1aa93))
* **5302:** resolve issue of empty TF plan detail ([abd814d](https://github.com/bcgov/platform-services-registry/commit/abd814d22d790360bf403ddf1a748cf303eca670))
* **5304:** restrict same id users to be added to team contacts ([a67f6ec](https://github.com/bcgov/platform-services-registry/commit/a67f6ecaeeb5765b5e450f9c11b9c4cd52f5e7c8))
* **5337:** delete only pending billings for the current project ([fa1785f](https://github.com/bcgov/platform-services-registry/commit/fa1785fa04f015e982b67230bf0ae5039320ed67))
## [0.55.0](https://github.com/bcgov/platform-services-registry/compare/v0.54.0...v0.55.0) (2025-03-27)

### Features

* **4743:** show users with incomplete idir profile ([d0ca5f5](https://github.com/bcgov/platform-services-registry/commit/d0ca5f5703af8c3051a11dcbe2dfe42500bdc186))
* **5109:** enable view profile for user records ([5c5b706](https://github.com/bcgov/platform-services-registry/commit/5c5b7067ebd5c8de76029bd53a82752d837189fa))
* **5244:** remove request review tasks on cancellation ([f0476a0](https://github.com/bcgov/platform-services-registry/commit/f0476a0026439af8fae2d0b400cda215f0bada59))
* **5282:** create webhook document if not exist ([d0186c1](https://github.com/bcgov/platform-services-registry/commit/d0186c117c499c82f9eaf7a71ceb84a3e916086e))
* **5308:** display build timestamp in footer ([6afa5ce](https://github.com/bcgov/platform-services-registry/commit/6afa5ce7eb03776c97437a81267a71557efb7b08))

### Refactors

* **5041:** rename db schemas and prepare migration script ([1acc920](https://github.com/bcgov/platform-services-registry/commit/1acc9202c7cc5b69691e067e7cbe10212bd80caa))

### End-to-end Testing

* **4167:** add compare data after edit request and refactoring ([59cc808](https://github.com/bcgov/platform-services-registry/commit/59cc808dfa6d1697d72d5412965427bb6f7e5c75))
## [0.54.0](https://github.com/bcgov/platform-services-registry/compare/v0.53.0...v0.54.0) (2025-03-24)

### Features

* **4980:** add user profile modal ([0bd8b9b](https://github.com/bcgov/platform-services-registry/commit/0bd8b9bc290e9b9e742e76c7c38b69082a3f18e6))
## [0.53.0](https://github.com/bcgov/platform-services-registry/compare/v0.52.0...v0.53.0) (2025-03-24)

### Features

* **5092:** add artifactory project to pre-deletion check ([03762d6](https://github.com/bcgov/platform-services-registry/commit/03762d609e62f5f142d5d8888bef495f67b50f03))
## [0.52.0](https://github.com/bcgov/platform-services-registry/compare/v0.51.0...v0.52.0) (2025-03-22)

### Features

* **4721:** update airflow with new provision api endpoint ([e014d0a](https://github.com/bcgov/platform-services-registry/commit/e014d0ab992dbf63ca6c6808a1766ab77a319aae))
* **4721:** update nats-provision with new provision api ([22ce701](https://github.com/bcgov/platform-services-registry/commit/22ce701b7b8d94b88dbcda3899cbd1b8776d9481))
* **4851:** make webhook visible and editable for global roles accordingly ([3ca9700](https://github.com/bcgov/platform-services-registry/commit/3ca9700f25ef46e3b34fd6cea56f33f473784d4b))
* **5257:** add tooltip for emerald cluster namespace subnets ([bd94c86](https://github.com/bcgov/platform-services-registry/commit/bd94c86183716cf4e314f9b3474afcbadb9c30a6))
* **5257:** reword tooltip message ([e697a6a](https://github.com/bcgov/platform-services-registry/commit/e697a6ac7d386bcc0f9c55ad4b2e013a344083cd))
## [0.51.0](https://github.com/bcgov/platform-services-registry/compare/v0.50.0...v0.51.0) (2025-03-19)

### Features

* **4966:** deprecate Bootstrap library in maintainance page ([c8da3ea](https://github.com/bcgov/platform-services-registry/commit/c8da3ea1dcad99cb7edbfe6ac7fc7d409aef1369))
## [0.50.0](https://github.com/bcgov/platform-services-registry/compare/v0.49.0...v0.50.0) (2025-03-14)

### Features

* **4721:** generate service account for new provision endpoint ([c0fa2bc](https://github.com/bcgov/platform-services-registry/commit/c0fa2bc47446d3c84d951e867a881e49c1e2a99d))
* **4750:** send cancellation notification emails ([16b3ffb](https://github.com/bcgov/platform-services-registry/commit/16b3ffb590bc5be6ce4e5368daa7402fa5d136e0))
* **5196:** convert lower cases into upper in account coding ([db51da8](https://github.com/bcgov/platform-services-registry/commit/db51da8a07c52e57faf30b23faac85e67464752a))
## [0.49.0](https://github.com/bcgov/platform-services-registry/compare/v0.48.0...v0.49.0) (2025-03-14)

### Features

* **0000:** give public admin billing privileges ([aa2055e](https://github.com/bcgov/platform-services-registry/commit/aa2055e0ae270e8e24e98cf40410eef73c6a881d))
* **4981:** include additional request details for cancellations ([483673f](https://github.com/bcgov/platform-services-registry/commit/483673fd03aaa9a6d545745c183b36bf68204f60))
## [0.48.0](https://github.com/bcgov/platform-services-registry/compare/v0.47.0...v0.48.0) (2025-03-13)

### Features

* **4742:** highlight the users missing with mandatory attributes ([f7175eb](https://github.com/bcgov/platform-services-registry/commit/f7175ebc1a15659673bd1180e09b1d652db9f45b))
* **4927:** add reusable TooltipTableHeader component ([0dbcf2e](https://github.com/bcgov/platform-services-registry/commit/0dbcf2e64778354ff57892055f41bf81cd3762f4))
* **5059:** update deploy dispatch workflow for automated versioning ([5d0bce8](https://github.com/bcgov/platform-services-registry/commit/5d0bce8b35132bb1114f43424679523735c73a1a))
* **5164:** update ministries list with Water, Land and Resource Stewardship ministry ([f7f3bbb](https://github.com/bcgov/platform-services-registry/commit/f7f3bbb53c4ca23d610b16d7984bca94a5a4a738))

### Bug Fixes

* **5188:** resolve EA signing eMOU ([9329daa](https://github.com/bcgov/platform-services-registry/commit/9329daab0bdd8bd119a8d250a2b463ffedf689b2))
## [0.47.0](https://github.com/bcgov/platform-services-registry/compare/v0.46.2...v0.47.0) (2025-03-11)

### Bug Fixes

* **5148:** resolve issue assigning service account role ([cd96025](https://github.com/bcgov/platform-services-registry/commit/cd960254129db93488da61f8248ece98e3d8efdd))
## [0.46.2](https://github.com/bcgov/platform-services-registry/compare/v0.46.1...v0.46.2) (2025-03-07)

### Features

* **5033:** add filters to public cloud analytics page ([7b3060c](https://github.com/bcgov/platform-services-registry/commit/7b3060ceff17d18c2d0e2a10d7cc6d9a46139023))
* **5078:** add disabled Quota section on new product page ([1c011d3](https://github.com/bcgov/platform-services-registry/commit/1c011d32f8e892af9e2261987431fbbe0cb57704))
* **5134:** add billing manager role ([e5b0376](https://github.com/bcgov/platform-services-registry/commit/e5b037607bffd97f07f988f188070c61ea229134))
## [0.46.1](https://github.com/bcgov/platform-services-registry/compare/v0.46.0...v0.46.1) (2025-03-07)

### Bug Fixes

* **5032:** ensure today's data is included in charts and update subtitles for accuracy ([0ae4e62](https://github.com/bcgov/platform-services-registry/commit/0ae4e621802cda929a50f5be3cc4b2ca3fd08402))
* **5032:** revert Histogram to a Client Component to fix function prop issue ([ed87da2](https://github.com/bcgov/platform-services-registry/commit/ed87da2925470b6eb1d2c881709172b14f0bfaad))
* **5121:** resolve permission issues regarding billing workflows ([cf0eac7](https://github.com/bcgov/platform-services-registry/commit/cf0eac7389da6bdd2f38f73a855c08bb4d6db136))
## [0.46.0](https://github.com/bcgov/platform-services-registry/compare/v0.45.0...v0.46.0) (2025-03-06)

### Features

* **4988:** add data migration script to add missing tasks ([4388b84](https://github.com/bcgov/platform-services-registry/commit/4388b843d637ab1e922826a800b4e90965130516))
## [0.45.0](https://github.com/bcgov/platform-services-registry/compare/v0.44.0...v0.45.0) (2025-03-06)

### Features

* **4982:** add private cloud cluster badge ([eb545a7](https://github.com/bcgov/platform-services-registry/commit/eb545a79616ae58fd26a627ca9f1df7c61c001dd))
* **5033:** add filters to private cloud analytics page ([f6582a7](https://github.com/bcgov/platform-services-registry/commit/f6582a71f2920658ccb84d423bfb2b313404b3e5))
* **5033:** add filters to private cloud analytics page ([8480354](https://github.com/bcgov/platform-services-registry/commit/8480354de60a9537eaa16a2e581a56d51c983164))
* **5057:** add migration script for public cloud billings ([9368886](https://github.com/bcgov/platform-services-registry/commit/93688860e2e0df16cb9ca02dbe3d5256102a1099))
* **5057:** enhance backend billing logic ([1a3665e](https://github.com/bcgov/platform-services-registry/commit/1a3665e80816ef47d54bc1e2cfbbb00572f182b0))
* **5057:** enhance email templates for billing workflow ([17c8715](https://github.com/bcgov/platform-services-registry/commit/17c87152a15c1890f69d3681118eb62f64aa915f))
* **5057:** enhance frontend billing logic ([6d4cd59](https://github.com/bcgov/platform-services-registry/commit/6d4cd592a657136c84a20834a8530253836008ef))
## [0.44.0](https://github.com/bcgov/platform-services-registry/compare/v0.43.15...v0.44.0) (2025-02-26)

### Features

* **5057:** enable AWS LZA public cloud provider in prod ([0fc4459](https://github.com/bcgov/platform-services-registry/commit/0fc44599c7a2457c13b4cd49ae7a321aa4bcce08))
## [0.43.15](https://github.com/bcgov/platform-services-registry/compare/v0.43.14...v0.43.15) (2025-02-26)

### Features

* **4973:** update Public Cloud product page based on provider ([5df467b](https://github.com/bcgov/platform-services-registry/commit/5df467b1fe50b684a79e83cbeea0eee9e008d446))
* **5012:** support Vanity URL route on maintenance mode ([320b00e](https://github.com/bcgov/platform-services-registry/commit/320b00eeed6c516850264496ce891f40b2b280a3))
* **5026:** add mask input component ([2c959d9](https://github.com/bcgov/platform-services-registry/commit/2c959d922e9db27a1141cfb76ec2eaf981b99f84))
* **5026:** enhance date picker modals & components ([dd1ef64](https://github.com/bcgov/platform-services-registry/commit/dd1ef64f7742d3572c12d034f003b118b3401349))
* **5026:** enhance user picker modals & components ([19497bd](https://github.com/bcgov/platform-services-registry/commit/19497bddf21e04eb4ad38ecab5d3da9fabe5e8f1))
* **5036:** add resend function on public cloud side ([fcb1ab4](https://github.com/bcgov/platform-services-registry/commit/fcb1ab4ee8e378dad1e5b0cf99cb62904947989d))
* **994:** add onboarding date field ([3e89485](https://github.com/bcgov/platform-services-registry/commit/3e89485e996f30e06344236dd5058cd23ca64d03))
## [0.43.14](https://github.com/bcgov/platform-services-registry/compare/v0.43.11...v0.43.14) (2025-02-21)

### Features

* **4484:** implement PO & TL picker for public cloud ([cc478be](https://github.com/bcgov/platform-services-registry/commit/cc478be596028f43f95b6ab1117e6044bcb5d286))
* **4484:** implement team contacts user picker for private cloud ([2a92130](https://github.com/bcgov/platform-services-registry/commit/2a921303d777bc7587c6e89e2e8169f827292534))
* **4829:** change maintenancedeployment file name and image-name ([e562104](https://github.com/bcgov/platform-services-registry/commit/e5621049b7045eb5efb6f9f5edd9d5494f623f8e))
* **4842:** add helm files for maintenance mode ([ee8f794](https://github.com/bcgov/platform-services-registry/commit/ee8f79456f79c4799ee253a558470f27f8de220d))
* **4843:** add GitHub dispatcher to toggle maintenance ([af0e751](https://github.com/bcgov/platform-services-registry/commit/af0e7519623c0bdcac2285ca31369dba5a462579))
* **4843:** add toggling maintenance mode dispatcher ([1972519](https://github.com/bcgov/platform-services-registry/commit/19725197da6088a9260ebe6a37b20a64347954ad))
* **4870:** improve admin billing page ([759b65a](https://github.com/bcgov/platform-services-registry/commit/759b65a2bd675f2a2500ee6d632e4e040f2808b8))
* **4912:** enhance admin event page ([e56677b](https://github.com/bcgov/platform-services-registry/commit/e56677badd06be760ba0c2c57124bdd7420a7e6a))
* **4918:** deprecate common components ([5871da0](https://github.com/bcgov/platform-services-registry/commit/5871da0f3def5152a1958b3d28cda5f74be42a82))
* **4926:** add cluster badge in private products ([4deff80](https://github.com/bcgov/platform-services-registry/commit/4deff80eae11d61488503f39c876fb1cc702eb6e))

### Bug Fixes

* **4983:** use original public cloud's team section component ([fea7036](https://github.com/bcgov/platform-services-registry/commit/fea7036d5530df0c6204c6eea3851e4bc4bd03c2))
* **4984:** resolve create page errors in public cloud ([f3959d8](https://github.com/bcgov/platform-services-registry/commit/f3959d8b60cdcdf308af6ba6192d9c2ba728bda7))
* **4987:** install cypress in CI pipelines ([3ac7f25](https://github.com/bcgov/platform-services-registry/commit/3ac7f25ac9b5ead1fd50ed879a0c83bff3619579))

### End-to-end Testing

* **4992:** adapt tests to new user picker component ([931fa63](https://github.com/bcgov/platform-services-registry/commit/931fa63a9421ef410a7e2138569ea282355a3108))
## [0.43.11](https://github.com/bcgov/platform-services-registry/compare/v0.43.10...v0.43.11) (2025-02-07)

### Features

* **4845:** add email resend button in admin tasks page ([835404b](https://github.com/bcgov/platform-services-registry/commit/835404b5212683c295388d05365376e149503999))

### Bug Fixes

* **4872:** fix deleting create request with initial account coding ([326be8b](https://github.com/bcgov/platform-services-registry/commit/326be8b5075064921370ac011b85a9ece6f9ed93))

### Refactors

* **4869:** add sharable additional team members component ([1a84265](https://github.com/bcgov/platform-services-registry/commit/1a84265648dbad1fa848debba0739c3732efa233))
## [0.43.10](https://github.com/bcgov/platform-services-registry/compare/v0.43.9...v0.43.10) (2025-02-05)

### Features

* **4740:** deploy developer docs in GitHub Pages ([06ccac1](https://github.com/bcgov/platform-services-registry/commit/06ccac183840174c1e1b249f9d70020cab1abaf5))
* **4829:** implement maintenance-app with its deployment pipeline ([0264c1f](https://github.com/bcgov/platform-services-registry/commit/0264c1f4e656d73ea5b3d2695fea2cb07327ce59))
* **4853:** enhance Tasks admin page ([411aa58](https://github.com/bcgov/platform-services-registry/commit/411aa5884d2c847f22ef77741b5890e21a980656))

### Bug Fixes

* **4846:** send emails when signing eMOU on exisiting products ([8af780a](https://github.com/bcgov/platform-services-registry/commit/8af780a98ab2f58dd2c455974184756adabddfbb))

### Refactors

* **4794:** upgrade ESlint version to V9 in app directory ([799a0d0](https://github.com/bcgov/platform-services-registry/commit/799a0d06d49cd833b411bc96b4703201a8b82a3d))
* **4794:** upgrade ESlint version to V9 in root directory ([98f2252](https://github.com/bcgov/platform-services-registry/commit/98f22528281f845c8c3482c0eeff237a986ac6c0))
## [0.43.9](https://github.com/bcgov/platform-services-registry/compare/v0.43.8...v0.43.9) (2025-01-30)

### Features

* **3116:** add MS365 mock integration test ([22124f0](https://github.com/bcgov/platform-services-registry/commit/22124f00f6ddaa1de5a45fdf7a4762c358f25188))
* **3162:** implement integration tests for email workflows ([5c382cb](https://github.com/bcgov/platform-services-registry/commit/5c382cb639eddd2d8a37c987125c73a984f50ed9))
* **4216:** upgrade MongoDB & Backup container versions ([2aee00a](https://github.com/bcgov/platform-services-registry/commit/2aee00ab2570d6db0fdcadaf06b82716492d6c4e))
* **4749:** redirect 404 page to home page ([971be62](https://github.com/bcgov/platform-services-registry/commit/971be62b0b30197b52887266f4b07ba9cefc23b8))
* **4771:** add data migration for Webhook URL duplication ([936dd37](https://github.com/bcgov/platform-services-registry/commit/936dd37f2d9e1e6b8bcf4fa4e7c69f4c7d95fcf0))

### Bug Fixes

* **4802:** resolve EMou Authority information discrepancy ([2b7d7e7](https://github.com/bcgov/platform-services-registry/commit/2b7d7e720bd8f8c9e328ca0a79661efb714a5262))

### End-to-end Testing

* **4311:** add delete request and delete approval tests public cloud ([2cab756](https://github.com/bcgov/platform-services-registry/commit/2cab7563d9a82fed98a9cbbcc2af161c8b0abeed))
* **4311:** exceed timeout for e2e github action ([874f937](https://github.com/bcgov/platform-services-registry/commit/874f937c887f98a63db6409befc657be7cc1d665))
## [0.43.8](https://github.com/bcgov/platform-services-registry/compare/v0.43.7...v0.43.8) (2025-01-25)

### Features

* **4502:** use BCSans font in emails ([6ecd1c6](https://github.com/bcgov/platform-services-registry/commit/6ecd1c67efe7f1e00e5110ca820e4d7594068988))
* **4746:** add password input components ([c148ac6](https://github.com/bcgov/platform-services-registry/commit/c148ac60fdaf095b2c94e8108fd0b26179e0bda3))
## [0.43.7](https://github.com/bcgov/platform-services-registry/compare/v0.43.6...v0.43.7) (2025-01-24)

### Features

* **3974:** add task page ([2cc9f2f](https://github.com/bcgov/platform-services-registry/commit/2cc9f2ff7d1c9633a8b64fb5eb850c53a9ada413))
* **4732:** send Webhook request on create events ([71b1dd9](https://github.com/bcgov/platform-services-registry/commit/71b1dd95300e2125d1a7a75dba5bfc28e1107b4d))
## [0.43.6](https://github.com/bcgov/platform-services-registry/compare/v0.43.5...v0.43.6) (2025-01-23)
## [0.43.5](https://github.com/bcgov/platform-services-registry/compare/v0.43.4...v0.43.5) (2025-01-23)

### Features

* **3973:** add data column to event table ([75c68a5](https://github.com/bcgov/platform-services-registry/commit/75c68a5249a31dd52b951486ef37ab9d21802882))
* **3973:** add events page ([ffd20bf](https://github.com/bcgov/platform-services-registry/commit/ffd20bfbd3a39d6b9edbaf3c837a134d0bc98ad3))
* **4100:** add multiple roles provisioning in localdev keycloak ([204efbd](https://github.com/bcgov/platform-services-registry/commit/204efbda4197bfdf5145bef242883b7cf1966b68))
* **4276:** add cancel operations for private/public clouds ([46b3baa](https://github.com/bcgov/platform-services-registry/commit/46b3baa7766d0568e9882cd2195659fc5b97ffdc))
* **4506:** add billing dates to dashboard ([38ada70](https://github.com/bcgov/platform-services-registry/commit/38ada70ebc63c37b5b1934d7e493bb681f1917ac))
* **4506:** add billing page ([1b831f0](https://github.com/bcgov/platform-services-registry/commit/1b831f01865afcc15c2a998ce1f97746118331ee))
* **4561:** replace GB with GiB for K8S units ([a1726ad](https://github.com/bcgov/platform-services-registry/commit/a1726ad2860f62d50497e2b083d5f03556f5eebe))
* **4695:** add Webhook URL DB migration script ([4a1577a](https://github.com/bcgov/platform-services-registry/commit/4a1577a8d9791386dcedb7f9aa89609c163544d3))
* **4695:** add Webhook validation mechanisms ([6f19b67](https://github.com/bcgov/platform-services-registry/commit/6f19b67897a7435f8130a901cc521fab056c2383))
* **4698:** revisit visual representation for event and billing pages ([a5f6b74](https://github.com/bcgov/platform-services-registry/commit/a5f6b74892f91e9a8fd54424e57411dac220eaed))

### Bug Fixes

* **4276:** delete public cloud specific task type ([13d56c6](https://github.com/bcgov/platform-services-registry/commit/13d56c63d93c1718f7e08bad3c42e4de58df692b))
* **4276:** disable decision page when appropriate ([17b93e0](https://github.com/bcgov/platform-services-registry/commit/17b93e05a00eb3c5c60844cd4a9a8985bdaf4e0c))
* **4276:** display billing info in request page ([76c67ba](https://github.com/bcgov/platform-services-registry/commit/76c67ba4cca179b993f250963630b6d5992670c3))

### End-to-end Testing

* **4313:** add approve request tests for public cloud ([ab6f560](https://github.com/bcgov/platform-services-registry/commit/ab6f560ba61e8e4b4ab85795aae434942cc30fd6))
## [0.43.4](https://github.com/bcgov/platform-services-registry/compare/v0.43.3...v0.43.4) (2025-01-06)

### Features

* **4544:** change condition for auto-approva ([766d7e5](https://github.com/bcgov/platform-services-registry/commit/766d7e5d64aa620d5eb08682af37c17c411922e4))
* **4602:** add debug timeouts to helm app jobs ([2c9cf86](https://github.com/bcgov/platform-services-registry/commit/2c9cf8663b29e978f98f00fc390c49461ab0d987))

### Bug Fixes

* **4589:** add a command to install keycloak-admin for nats-provision ([9fcabaa](https://github.com/bcgov/platform-services-registry/commit/9fcabaa31535176f43fd686d1716f3e86dbe2e32))
* **4589:** add a command to install keycloak-admin for nats-provision ([a32b89b](https://github.com/bcgov/platform-services-registry/commit/a32b89b4005818b48bfbe984b8a001bd23287f05))
* **4602:** add --no-frozen-lockfile flag to pnpm install calls ([bd999e4](https://github.com/bcgov/platform-services-registry/commit/bd999e4003d92ba4e8923a4078336d545f6fce84))
* **4602:** add --no-frozen-lockfile flag to pnpm install calls ([aa95d1d](https://github.com/bcgov/platform-services-registry/commit/aa95d1d675eea3ed75b5c54969d11d18c358a35d))
* **4602:** fix pnpm dependencies, add fix keycloak-provision docker file ([9cf2cc8](https://github.com/bcgov/platform-services-registry/commit/9cf2cc8528dfe291520cffe8104f6a08dee8bab3))
* **4602:** revert debug timeouts to helm app jobs ([04225a9](https://github.com/bcgov/platform-services-registry/commit/04225a94c5d077df83a8c00ca1a0288e4f8add9d))
* **4602:** revert the nodejs upgrade 22.12 to 22.10 ([2f8402c](https://github.com/bcgov/platform-services-registry/commit/2f8402c557daeac6b1400ba614bd9af36239ae98))
## [0.43.3](https://github.com/bcgov/platform-services-registry/compare/v0.43.2...v0.43.3) (2024-12-31)

### Features

* **4582:** add user roles to session roles if exist ([1b1765a](https://github.com/bcgov/platform-services-registry/commit/1b1765a12eaf84c8fa9814cbb116da64b9518f6a))

### Refactors

* **4545:** update sandbox Node.js apps following the convention ([ae30d7b](https://github.com/bcgov/platform-services-registry/commit/ae30d7bfc0cf6f6981f0fe9ca5ab53fa4c532cfc))
* **4560:** use task module for creating and closing tasks ([7891965](https://github.com/bcgov/platform-services-registry/commit/7891965c6fc6d4d7215f3405b9bc330f5c858701))
## [0.43.2](https://github.com/bcgov/platform-services-registry/compare/v0.43.1...v0.43.2) (2024-12-19)
## [0.43.1](https://github.com/bcgov/platform-services-registry/compare/v0.43.0...v0.43.1) (2024-12-19)

### Features

* **3225:** add pvc for mailpit ([fae02e8](https://github.com/bcgov/platform-services-registry/commit/fae02e8751d2c5325a9f9ebfd4c87817bd3d2b1a))
* **4397:** add GET product API endpoint ([3c4aefc](https://github.com/bcgov/platform-services-registry/commit/3c4aefc692651e0df97bd97904b4cbb2aff9b79e))
* **4398:** add Webhook URL on private cloud products' forms ([5ac7656](https://github.com/bcgov/platform-services-registry/commit/5ac7656833045703104cc1f49e3b774566c663e7))
* **4494:** remove limits column for resource usage tab, revise conditons wording for quota change ([4abc562](https://github.com/bcgov/platform-services-registry/commit/4abc562c45babe93fd336f68e5eb208b9ab6a3f6))
* **4537:** store user session data in DB ([616d255](https://github.com/bcgov/platform-services-registry/commit/616d2558319a1af421096a5f42e01b50e0518e0d))

### Bug Fixes

* **4527:** resolve issue reviewing public cloud delete requests ([e368004](https://github.com/bcgov/platform-services-registry/commit/e368004926b0c0ba25930c69bbc8d3e91c43d329))

### Docs

* **4352:** update documentation to include Mailpit and ches-mock details ([d21f0ef](https://github.com/bcgov/platform-services-registry/commit/d21f0effa72578fdbedd9cdc3941d2d4ebe21528))

### Refactors

* **4094:** use simple list of mock users for sandbox ([1b258c4](https://github.com/bcgov/platform-services-registry/commit/1b258c422127850807f0ccb620d5a812eeaf9257))
## [0.43.0](https://github.com/bcgov/platform-services-registry/compare/v0.42.1...v0.43.0) (2024-12-13)

### Features

* **2997:** enhance query performance by adding MongoDB indexes ([0e0c7ba](https://github.com/bcgov/platform-services-registry/commit/0e0c7ba8d9ff50c405c519c7685a7369aba7ef13))
* **3225:** add MailPit and CHES mock Helm deployment ([5136fae](https://github.com/bcgov/platform-services-registry/commit/5136fae068dc8bb08126c5920ceff7841293ba3f))
* **4026:** refresh keycloak tokens without signing out ([41d20c1](https://github.com/bcgov/platform-services-registry/commit/41d20c1650dae0e84be312e18fcde9293fae929a))
* **4351:** sanitize email body ([a4c3134](https://github.com/bcgov/platform-services-registry/commit/a4c3134694f560d741bbc799937893b845547c6b))
* **4459:** enhance deployment pipelines to wait till complete ([a9c6c4b](https://github.com/bcgov/platform-services-registry/commit/a9c6c4b0f119b48c864c67af4ef128f8ef80d4b8))
* **4481:** add additional subscribers in NATs message ([726be77](https://github.com/bcgov/platform-services-registry/commit/726be77bdfccae1994463b0039023fab430df1d4))
## [0.42.1](https://github.com/bcgov/platform-services-registry/compare/v0.42.0...v0.42.1) (2024-12-10)

### Features

* **2997:** add environment variable to print database logs ([85e308c](https://github.com/bcgov/platform-services-registry/commit/85e308cee52e1cfb9f8d6ad03f9fa3ae92654595))
* **4407:** log request and response details for failed test API calls ([b09c1fb](https://github.com/bcgov/platform-services-registry/commit/b09c1fb1e6303c99f4977e52fb9127654e594539))

### Bug Fixes

* **4412:** display short server error message ([c5e1e37](https://github.com/bcgov/platform-services-registry/commit/c5e1e37d92b4c88b8fe2465650050fbdaf7e9460))
* **4426:** hide namespace information for new products ([620ce2a](https://github.com/bcgov/platform-services-registry/commit/620ce2a8b55c74e1fb238325958f0de0bddf3bfd))

### Refactors

* **4096:** remove npm install from action ([f28c263](https://github.com/bcgov/platform-services-registry/commit/f28c263eda38184233af098b94eef238d6692012))
* **4096:** remove package-lock from release-it ([0e196b8](https://github.com/bcgov/platform-services-registry/commit/0e196b87b36f946344e14bb2b593baac52ae88e1))
* **4096:** use pnpm in app directory ([ae3049f](https://github.com/bcgov/platform-services-registry/commit/ae3049f8f54f56c47026438a7ec98d7ffc5a50df))
* **4096:** use pnpm in data-migrations directory ([b895f79](https://github.com/bcgov/platform-services-registry/commit/b895f79a8b4873ae40a806350918ea1d2c20977c))
* **4096:** use pnpm in localdev directory ([60c5e17](https://github.com/bcgov/platform-services-registry/commit/60c5e170893c271134dc3da3e84cbd2aedc9fc57))
* **4096:** use pnpm in root directory ([c687c7a](https://github.com/bcgov/platform-services-registry/commit/c687c7a55ccf995f5107e3c30f6ff9a06e41e801))
## [0.42.0](https://github.com/bcgov/platform-services-registry/compare/v0.41.1...v0.42.0) (2024-12-05)

### Features

* **4093:** add task type 'Review Requests' ([1884c0f](https://github.com/bcgov/platform-services-registry/commit/1884c0fe2a3784745ae602d0cc0382dcf140685d))
* **4188:** provide input box for resource requests ([c672284](https://github.com/bcgov/platform-services-registry/commit/c672284cb53636ae33bfdad3967ac2e25190297a))

### End-to-end Testing

* **4125:** edit request for public cloud and couple of fixes ([e6adb46](https://github.com/bcgov/platform-services-registry/commit/e6adb464992232b22e83db528eaad457e9a41c2e))
## [0.41.1](https://github.com/bcgov/platform-services-registry/compare/v0.41.0...v0.41.1) (2024-12-03)

### Features

* **4368:** add user reader role ([549aaad](https://github.com/bcgov/platform-services-registry/commit/549aaad302799841476f4c1d2cafa429bae6a0f9))
## [0.41.0](https://github.com/bcgov/platform-services-registry/compare/v0.40.6...v0.41.0) (2024-11-29)

### Features

* **4363:** add export function on users page ([e4b756f](https://github.com/bcgov/platform-services-registry/commit/e4b756f143371556b4b6f15d39a129f870b50c16))
## [0.40.6](https://github.com/bcgov/platform-services-registry/compare/v0.40.5...v0.40.6) (2024-11-29)
## [0.40.5](https://github.com/bcgov/platform-services-registry/compare/v0.40.4...v0.40.5) (2024-11-29)
## [0.40.4](https://github.com/bcgov/platform-services-registry/compare/v0.40.3...v0.40.4) (2024-11-28)

### Features

* **4304:** add user role update function in users page ([9cc1daa](https://github.com/bcgov/platform-services-registry/commit/9cc1daabd6f9579bad153dff739c8845b33902d9))
## [0.40.3](https://github.com/bcgov/platform-services-registry/compare/v0.40.2...v0.40.3) (2024-11-22)

### Features

* **3190:** display product requests comments ([b53a8e6](https://github.com/bcgov/platform-services-registry/commit/b53a8e6640e2194ddf042ab1ff56abfd0fb43124))
* **3418:** display subnet info for namespace in emerald cluster ([cc1cd04](https://github.com/bcgov/platform-services-registry/commit/cc1cd049f62ecd052d577beb0d8d24097a66a9ad))
## [0.40.2](https://github.com/bcgov/platform-services-registry/compare/v0.40.1...v0.40.2) (2024-11-21)

### Bug Fixes

* **4294:** fix the issue setting temporary product by admin ([4a59596](https://github.com/bcgov/platform-services-registry/commit/4a59596d991eca990fb98f4b2eae2598cf829ee4))
## [0.40.1](https://github.com/bcgov/platform-services-registry/compare/v0.40.0...v0.40.1) (2024-11-20)

### Features

* **3197:** enhance popup notifications ([65c8886](https://github.com/bcgov/platform-services-registry/commit/65c8886dc1ac3ca0a648e9428ef3f367c0a849d1))
* **3972:** add admin users page ([3917556](https://github.com/bcgov/platform-services-registry/commit/39175564fef9f12f4199cef6151117158298eaac))
* **4250:** send MailChimp emails to subscriber role members ([ee94fad](https://github.com/bcgov/platform-services-registry/commit/ee94fadf9b8da8dff45d8e319b81b0253c89426d))
* **4284:** auto-approve initial temporary product requests ([c7231b1](https://github.com/bcgov/platform-services-registry/commit/c7231b1ae74d4812e96771ff2ccadefc738b5b55))

### End-to-end Testing

* **4259:** adapt tests to new components and refactor delete test ([ad7daf1](https://github.com/bcgov/platform-services-registry/commit/ad7daf1e2dfc752997ab4d7da5b97c5066cb097b))
## [0.40.0](https://github.com/bcgov/platform-services-registry/compare/v0.39.2...v0.40.0) (2024-11-15)

### Features

* **3097:** add additional product members in private cloud ([e314d6d](https://github.com/bcgov/platform-services-registry/commit/e314d6d650f0431ddc021e966bf0bfea1afa774d))
* **3314:** enforce distinct idir for PO and TL ([a92b0bd](https://github.com/bcgov/platform-services-registry/commit/a92b0bdb3e0a970feb881dd6c8639a4fb3f58b04))
* **4123:** add additional product members in public cloud ([39f5865](https://github.com/bcgov/platform-services-registry/commit/39f586558d1afbc07f28489592392a78acf7815b))
* **4123:** include member changes in public cloud emails ([fde9253](https://github.com/bcgov/platform-services-registry/commit/fde9253d76d1ad40372a146cc849320197d67bfb))
* **4215:** update private cloud Nats message ([f41fb2f](https://github.com/bcgov/platform-services-registry/commit/f41fb2feb0e3c76c9d29065297f45bb1678e6ec7))
* **4221:** use different view for disabled multi-select ([2a70608](https://github.com/bcgov/platform-services-registry/commit/2a70608ee83d9293f8ab64d52eb501002d92c43e))
* **4229:** add generic dollar inputs ([611028a](https://github.com/bcgov/platform-services-registry/commit/611028a747a669ee06e42ce32963a77b366e537b))

### Bug Fixes

* **4196:** resolve issues with react-email/render version ugrade ([adcf70d](https://github.com/bcgov/platform-services-registry/commit/adcf70d498d6a65023519541fea03f2d15529305))

### Docs

* **cd:** add debug deployments guide ([b66110c](https://github.com/bcgov/platform-services-registry/commit/b66110c335e3dba8657066228fafbe2154455f69))
* update Helm deployment failure debug doc ([8f79060](https://github.com/bcgov/platform-services-registry/commit/8f790603331310ed0188effb45b760225565ff6b))

### Refactors

* **4208:** replace classNames with clsx ([3bf622b](https://github.com/bcgov/platform-services-registry/commit/3bf622ba9fe6e39eedfd196573ca8fc969599e46))
* **4212:** add private cloud prefix to MOU tasks ([85fa535](https://github.com/bcgov/platform-services-registry/commit/85fa5353f10f2e335f629d0bc583781e85860359))
* **4227:** replace textarea and multi-select with common components ([d60eb1a](https://github.com/bcgov/platform-services-registry/commit/d60eb1ade77dff959716f8442341156a67aee376))
* **4229:** replace input and with common components ([307da03](https://github.com/bcgov/platform-services-registry/commit/307da034b8b6be510c8580133915d9c8559e8b97))
* **4242:** replace button and with common components ([f2517f8](https://github.com/bcgov/platform-services-registry/commit/f2517f8ce1f24577e52f84d7fe6103f862a0454f))
## [0.39.2](https://github.com/bcgov/platform-services-registry/compare/v0.39.1...v0.39.2) (2024-11-06)

### Bug Fixes

* **4123:** grant view permission of create requests to admins ([72540b3](https://github.com/bcgov/platform-services-registry/commit/72540b34a452edb84ec5d42e4ec1a313b2fa253c))
## [0.39.1](https://github.com/bcgov/platform-services-registry/compare/v0.39.0...v0.39.1) (2024-11-06)

### Features

* **4156:** add user search reusable picker modal ([e3e49b0](https://github.com/bcgov/platform-services-registry/commit/e3e49b06fac4ca9cabe5e74b429cc72bc6df73eb))

### Bug Fixes

* **4165:** replace generic select with dropdown for cluster ([5e7650b](https://github.com/bcgov/platform-services-registry/commit/5e7650b746170d9ce5d1969e054f49ec07d2c94b))
## [0.39.0](https://github.com/bcgov/platform-services-registry/compare/v0.38.0...v0.39.0) (2024-11-04)

### Features

* **1920:** secure provisioner callback URLs ([b119b7a](https://github.com/bcgov/platform-services-registry/commit/b119b7a44ce88719646b85e58172f6b848f5d91a))

### Bug Fixes

* **4110:** hide quota change information section when reviewing ([30640ff](https://github.com/bcgov/platform-services-registry/commit/30640ff06336540cd8886cbd1aeaf9495c819d08))
* **4110:** remove quota change information section from decision page ([5876879](https://github.com/bcgov/platform-services-registry/commit/5876879a1d17055dca9982f28facf30a0b8fcec3))
## [0.38.0](https://github.com/bcgov/platform-services-registry/compare/v0.37.2...v0.38.0) (2024-10-30)

### Features

* **2692:** scan image builds for vulnerabilities ([507e753](https://github.com/bcgov/platform-services-registry/commit/507e753af62f960459e111c2e62230e5ae0012b3))
* **3812:** tweak edit private cloud test to run in github actions and new UI ([4a6d3b4](https://github.com/bcgov/platform-services-registry/commit/4a6d3b47701bfce5e6dd38a2bb4185c23db29268))
* **3813:** add storage data to UI and auto approval check ([083a7e4](https://github.com/bcgov/platform-services-registry/commit/083a7e401a14077eba2c7ce99eafd9f61eef994a))
* **3989:** tweak e2e create private and public cloud tests for new UI ([e5f4379](https://github.com/bcgov/platform-services-registry/commit/e5f4379f57561746c4c992b146e09e9a1a546162))
* **4121:** change tests to correspond to new modal component ([419db65](https://github.com/bcgov/platform-services-registry/commit/419db65d3f3c1d0aa8ec1c741cb606ae6a031db9))

### Bug Fixes

* **2692:** edit image url ([6388060](https://github.com/bcgov/platform-services-registry/commit/6388060c116d9420be022a46c2f2da04cf18d225))

### Docs

* add resource metrics setup ([2d85fc4](https://github.com/bcgov/platform-services-registry/commit/2d85fc44de00c52ccfb82cd667cf3a629ced2ca5))

### Refactors

* **3791:** simply the usage of common modal components ([57c17c2](https://github.com/bcgov/platform-services-registry/commit/57c17c299350dc750aa772ca5586e05ce729e6b7))
* **4055:** replace create request submit modals ([7ca93c4](https://github.com/bcgov/platform-services-registry/commit/7ca93c4437aa31be14480ff9e4ced9a106c5c173))
* **4055:** replace notification & confirmation modals ([68b82f4](https://github.com/bcgov/platform-services-registry/commit/68b82f4e8e6840abe59b0ab2402e4465c4a60251))
* **4055:** replace product delete modals ([6c7c439](https://github.com/bcgov/platform-services-registry/commit/6c7c439ce720dd7398569df099dac33fe14e5ab7))
* **4055:** replace request edit submit modals ([1ab556b](https://github.com/bcgov/platform-services-registry/commit/1ab556b28263183ab2acc93e31ee895ab4cf26de))
* **4055:** replace review modals ([0447eee](https://github.com/bcgov/platform-services-registry/commit/0447eee856e6d759f8bd3e8733cac731327090d6))
* **4076:** upgrade Next.js to version 15 ([2f3d7a1](https://github.com/bcgov/platform-services-registry/commit/2f3d7a169af9337c99e3a812cb3b7b871c5fd18a))
## [0.37.2](https://github.com/bcgov/platform-services-registry/compare/v0.37.1...v0.37.2) (2024-10-22)
## [0.37.1](https://github.com/bcgov/platform-services-registry/compare/v0.37.0...v0.37.1) (2024-10-21)

### Features

* **4018:** add side panel for assigned tasks ([63568c4](https://github.com/bcgov/platform-services-registry/commit/63568c4c6482134836ec60656fd77fdd6695c5a1))

### Docs

* **2692:** compare docker image scanning tools ([e03d3f8](https://github.com/bcgov/platform-services-registry/commit/e03d3f87fc793459d95b36fa0acea62cff554bc8))
## [0.37.0](https://github.com/bcgov/platform-services-registry/compare/v0.36.1...v0.37.0) (2024-10-17)

### Features

* **3118:** lint commit messages locally and in CI ([ccf0962](https://github.com/bcgov/platform-services-registry/commit/ccf09621465776713d4c9bc3c9d682ab59f0b5f1))
* **3365:** update common language to sentence case ([e9d9bcf](https://github.com/bcgov/platform-services-registry/commit/e9d9bcf416e9e510d57458aa0dcc0c3dc3ca0cae))
* **3792:** add reviewer roles and deprecate admin emails ([09ce342](https://github.com/bcgov/platform-services-registry/commit/09ce342992c193a4cb9e44c0c6541ad5d697d41f))
* **3794:** enhance rocket.chat notifications for deployment statuses ([e54f1d5](https://github.com/bcgov/platform-services-registry/commit/e54f1d5d73fb5f6ef1b0be5a429be9c3627c0754))
* **3936:** add create, update methods into session models ([bbf3ad4](https://github.com/bcgov/platform-services-registry/commit/bbf3ad4023dfbb3a756ea2d4a34ca0734acbbb71))
* **3937:** add a billing reader role ([4378684](https://github.com/bcgov/platform-services-registry/commit/43786845a913876ef4d8bb999991da17c94c7a31))
* **3954:** send rocketchat alerts when airflow tasks fail ([334e0de](https://github.com/bcgov/platform-services-registry/commit/334e0de12644ef8640bb244c11bfcbb83cc75748))
* **3966:** add empty quota option and update backend logic ([5c1d4b5](https://github.com/bcgov/platform-services-registry/commit/5c1d4b519f482eab29701924d5388858c67d7bca))

### Bug Fixes

* **4005:** set createdByEmail field optional ([8dbe5df](https://github.com/bcgov/platform-services-registry/commit/8dbe5dfbe43f26f172b4a9f30384559e144537be))

### Refactors

* **3792:** replace string roles to GlobalRole enum object values ([ced9b80](https://github.com/bcgov/platform-services-registry/commit/ced9b80e380e833dab093059f77929247bf68ee7))
* **3936:** add DB services for available entities ([1b8b787](https://github.com/bcgov/platform-services-registry/commit/1b8b787ee4620a1ea7af18d72537ba526cfce32c))
* **3936:** move database helper functions into DB service ([34db605](https://github.com/bcgov/platform-services-registry/commit/34db60557563f2f105810ac51ae418e63848319f))
* **3966:** cleanup resource types ([78104f1](https://github.com/bcgov/platform-services-registry/commit/78104f17ec204f3e3bf19dceeb6b3ee42c61be7c))
## [0.36.1](https://github.com/bcgov/platform-services-registry/compare/v0.36.0...v0.36.1) (2024-10-09)

### Bug Fixes

* **replace-broken-link:** correct link for quota increase request process ([d8ca544](https://github.com/bcgov/platform-services-registry/commit/d8ca544ba9c2dc7f5ce701d47e6cafbf9589ad31))

### Refactors

* **3936:** add DB services for products and requests ([6a7ec96](https://github.com/bcgov/platform-services-registry/commit/6a7ec96fcd47974393aacc399c24c2990b56c9b1))
## [0.36.0](https://github.com/bcgov/platform-services-registry/compare/v0.35.0...v0.36.0) (2024-10-08)

### Features

* **1008:** update Golddr provisioning workflow to receive two callbacks ([e69669e](https://github.com/bcgov/platform-services-registry/commit/e69669edc7c4727a82564debe323071cc5644fa2))
* **3361:** display context in the application header ([16c3ba7](https://github.com/bcgov/platform-services-registry/commit/16c3ba7f1f2b84d4e2b5805d59e9d96fd7900737))
* **3730:** add ministry, cluster and provider for sorting capas ([dd7cd42](https://github.com/bcgov/platform-services-registry/commit/dd7cd42d278833f0f8d08a47f594ed485839b370))
* **3925:** use progress design in request list pages ([25aa1a4](https://github.com/bcgov/platform-services-registry/commit/25aa1a43f7c67b9d4f39bc443245e8ab3d6dfa79))
* **eMOU:** give temporary permission to public document as EA ([2c091c7](https://github.com/bcgov/platform-services-registry/commit/2c091c788ad34e4c4bc835b81d1dea2f27c61916))
## [0.35.0](https://github.com/bcgov/platform-services-registry/compare/v0.34.3...v0.35.0) (2024-10-03)

### Features

* **2827:** add generic text input components ([14bcbb7](https://github.com/bcgov/platform-services-registry/commit/14bcbb7a48cb16987a44b8889ea377fba8f01bda))
* **2827:** add HookFormMultiSelect ([499d55d](https://github.com/bcgov/platform-services-registry/commit/499d55d20894c34dad9ed8f78e3a3f3d30cfc5aa))
* **2828:** add generic textarea components ([08e9d02](https://github.com/bcgov/platform-services-registry/commit/08e9d02d6e94a2105b3f67da3fbb17b379ee1de6))
* **3165:** enhance search, filter, and sort on private products ([a94f71f](https://github.com/bcgov/platform-services-registry/commit/a94f71f218b910472a0ee695daccdb091fb8e458))
* **3166:** enhance search, filter, and sort on private requests ([dc40523](https://github.com/bcgov/platform-services-registry/commit/dc40523437ecb123f52b59015123ab85533da8d6))
* **3167:** enhance search, filter, and sort on private cloud pages ([f03a703](https://github.com/bcgov/platform-services-registry/commit/f03a7034e75de5cc5514206d000dd896d5d72140))
* **3635:** add backend logic for quota auto-approval ([62e3448](https://github.com/bcgov/platform-services-registry/commit/62e3448e951565600d354bde3a799f15a5cdb084))
* **3635:** store quota resource detail in request doc ([7199058](https://github.com/bcgov/platform-services-registry/commit/7199058432ef21d6ece3aa561ab14eea5e076a27))
* **3636:** track reasons for selecting cloud provider ([fbedcc1](https://github.com/bcgov/platform-services-registry/commit/fbedcc16de0680252b30f9025197b5d26b24456c))
* **3637:** display quota change status in UI ([8710f1b](https://github.com/bcgov/platform-services-registry/commit/8710f1bad0763deac71b670f139efd82a03076b4))
* **3637:** send admin email for quota auto-approval ([2621f07](https://github.com/bcgov/platform-services-registry/commit/2621f07d994dcda86fc4838c48192b318564dbd0))
* **3849:** add a new public cloud provider AWS-LZA ([7750548](https://github.com/bcgov/platform-services-registry/commit/775054824a6c6b471f31a296ec1a6331b0ca9536))

### Bug Fixes

* **3872:** update headers on products/requests pages ([4e405cc](https://github.com/bcgov/platform-services-registry/commit/4e405cc77c64bb134183e6af1aec6f6d6dc8dfa3))
* **mailchimp:** wait for batch operation to complete before starting next ([691ebe2](https://github.com/bcgov/platform-services-registry/commit/691ebe21d3c06e0fdbc15472fcc14f0089da334c))
## [0.34.3](https://github.com/bcgov/platform-services-registry/compare/v0.34.2...v0.34.3) (2024-09-27)

### Bug Fixes

* pass licence plates into proper field ([48eea32](https://github.com/bcgov/platform-services-registry/commit/48eea32a8edf2d7002463156917486704b00c8e6))
## [0.34.2](https://github.com/bcgov/platform-services-registry/compare/v0.34.0...v0.34.2) (2024-09-24)

### Features

* **3165:** add label and select generic components ([27e2187](https://github.com/bcgov/platform-services-registry/commit/27e218782427c8f1527d229a652adb55bc1b1d3c))
* **3364-3361:** hightlight changes to quota and reorder namespaces ([b6d447d](https://github.com/bcgov/platform-services-registry/commit/b6d447deb45cfac90dabfdb820e6656f3fa05973))
* **3471:** add usage metrics for namespaces pods ([ebed667](https://github.com/bcgov/platform-services-registry/commit/ebed6673955e6efb9154457ae3d856a661da8954))
* **3593-2:** add 'Completed' email template and trigger on edit request completed; update Approved email template ([830bc12](https://github.com/bcgov/platform-services-registry/commit/830bc12fa6ae20f341c12c511712335b2f159a80))
* **3593-2:** adjust email templates for provisioning and editing products ([c28d189](https://github.com/bcgov/platform-services-registry/commit/c28d18973c86bc1f868a1721e454320a13608869))
* **3593-3:** update mermaid diagram ([4cfdbdc](https://github.com/bcgov/platform-services-registry/commit/4cfdbdc3a6c85e49fb471927f6addeaa78f1b3ab))
* **3593:** modify approval email templates and triggers. ([4a65e3f](https://github.com/bcgov/platform-services-registry/commit/4a65e3f9d6ee86f0de15e2efaec5e11e2ba7eb68))
* **3593:** modify request approval email templates and triggers ([e59b808](https://github.com/bcgov/platform-services-registry/commit/e59b80831254c0309cfe517b0482274ae115c0bc))
* **3647:** add saving screenshots, tweak e2e tests and sandbox image pulls ([bb9faa1](https://github.com/bcgov/platform-services-registry/commit/bb9faa14ce87f14ba20b195765edcb04693682c6))
* **3663:** add graphic for when there are no comments to display ([296c19e](https://github.com/bcgov/platform-services-registry/commit/296c19e2ec24747c03eb203435fde07c8adf77a7))
* **3669:** enhance eMOU workflow ([286f486](https://github.com/bcgov/platform-services-registry/commit/286f486c8cecbabcecd37cf7725d9afc81bde673))
* **3697:** add separate billing code by providers ([9e117aa](https://github.com/bcgov/platform-services-registry/commit/9e117aaa2181ca48e17a40a03f86f8af76310ae9))
* **3717:** add an admin script to resend eMOU signing emails ([1b7f909](https://github.com/bcgov/platform-services-registry/commit/1b7f909cde83ac07e55ba69c5297609bca4a495f))
* **3814:** tweak public cloud create test to run in github actions ([093dc74](https://github.com/bcgov/platform-services-registry/commit/093dc7490dfcf0dfeda0bd48c41e9b10b16d7530))
* **analytics:** add quota summary CSV endpoint ([71ffed4](https://github.com/bcgov/platform-services-registry/commit/71ffed46210a78dfa1471c7354fc0e3ef5f950b4))

### Bug Fixes

* **3364:** reorder quota namespaces in private cloud ([ef7335c](https://github.com/bcgov/platform-services-registry/commit/ef7335c88c32e5b168e219c086b855953ec85d42))
* **3573:** capitalize CPU in the request summary page ([cf770a7](https://github.com/bcgov/platform-services-registry/commit/cf770a7489eb695562d7c12fd57e41b0be0163a8))
* **3642:** update eMOU document for platform name ([83b1a1f](https://github.com/bcgov/platform-services-registry/commit/83b1a1fcadf27a71cd1f920dc6ba4b045c86dd3e))
* **3773:** apply minimum validation for delete request decision ([18248a4](https://github.com/bcgov/platform-services-registry/commit/18248a4a2dcd26a3905636b555f846022860ca3f))
* **3782:** resolve the issue approving edit requests ([9e1da00](https://github.com/bcgov/platform-services-registry/commit/9e1da00bcbac02efb53e5980d6ebc6ea78388ee2))
* **3795:** remove duplicate group names ([1004aaf](https://github.com/bcgov/platform-services-registry/commit/1004aaf12c791c3f9763c3faa1ba14a1416989d2))
* **3795:** update Keycloak role fetching logic ([ddd262e](https://github.com/bcgov/platform-services-registry/commit/ddd262ea168b916b922fab3cfb4da4360e4a4271))

### Refactors

* **3731:** revisit comment sections on email templates ([ceb9cd7](https://github.com/bcgov/platform-services-registry/commit/ceb9cd70ee8f79b30fdaeb375fad2d3d11adb700))
* **3747:** optimize email templates ([c189f41](https://github.com/bcgov/platform-services-registry/commit/c189f41022bbb618bda02ee38f69a3cf84c91389))
* **3747:** organize email templates ([d1ee4ef](https://github.com/bcgov/platform-services-registry/commit/d1ee4efeed94e33b0f04aceca995257b5c2332ac))
* **3747:** organize email templates' types ([a822488](https://github.com/bcgov/platform-services-registry/commit/a8224885a74107dc647854cf20516154b5831682))
* **3747:** update the email template function definitions ([352e8d1](https://github.com/bcgov/platform-services-registry/commit/352e8d1c676a15a222578c92cbaae11554fcfb1c))
## [0.34.0](https://github.com/bcgov/platform-services-registry/compare/v0.33.2...v0.34.0) (2024-09-04)

### Features

* **227:** add accordion components ([67bfc0b](https://github.com/bcgov/platform-services-registry/commit/67bfc0b17698f23e86a1d9f5a048ee7143e10fef))
* **3191:** add admin tooltip and notification ([5dd8d65](https://github.com/bcgov/platform-services-registry/commit/5dd8d65f9b0e5f0f6570bcc472a7d7a3c67b7157))
* **3191:** add admin tooltip and notification ([db54d5a](https://github.com/bcgov/platform-services-registry/commit/db54d5a178d16538ecffe9b0081ad5a1285aa78a))
* **3414:** add eMOU sign & review workflows ([3b1c1dc](https://github.com/bcgov/platform-services-registry/commit/3b1c1dc232d78462946438d1dd2784063e3657e0))
* **3414:** update eMOU PDF content ([5ad8dce](https://github.com/bcgov/platform-services-registry/commit/5ad8dce8e63c04c17fe0a53a1d20a63c13d4e445))
* **3467:** refactor create test for private and public cloud ([ace5c15](https://github.com/bcgov/platform-services-registry/commit/ace5c154d1d063e751edd980cd9f9d7cb8e331d5))
* **3500:** send billing EMOU review request emails ([f853351](https://github.com/bcgov/platform-services-registry/commit/f85335119a29c5b8f5c461aeea6b174fccf3c312))
* **3501:** add eMOU PDF download link ([a1996a9](https://github.com/bcgov/platform-services-registry/commit/a1996a90cd90d3d6e0d0b9f6be744db588eace71))
* **3501:** use WeasyPrint to download PDF ([6610bfe](https://github.com/bcgov/platform-services-registry/commit/6610bfe2f397675b48209edfddbb5f5b8731863b))
* **3576:** include MS AD user object ID into public cloud NATS ([b18cbe7](https://github.com/bcgov/platform-services-registry/commit/b18cbe71ece923167d0c15cc160a56156df0c9e3))
* **3587:** merge steps definition to common file, refactor edit request ([9da9596](https://github.com/bcgov/platform-services-registry/commit/9da9596bc2fdd3cd20170e16cd09834c39ccdf6a))
* **3593-1:** modify create, delete, edit and approve request templates ([6e021a8](https://github.com/bcgov/platform-services-registry/commit/6e021a81482d87c3e3bf17c8cdf9ed96b3501c32))

### Bug Fixes

* **2543:** send approve email for not quota increase edit ([d3ed2d7](https://github.com/bcgov/platform-services-registry/commit/d3ed2d7aa94f7ad963b17e9053aac33d0b6979de))
* **3157:** udpate delete modal UI ([556841d](https://github.com/bcgov/platform-services-registry/commit/556841d381034d3b18b9545bb47a79747cf7e59c))
* **3157:** update delete confirmation modal ([b6994da](https://github.com/bcgov/platform-services-registry/commit/b6994da906ffa9b3db29af1df6a3314274b2bd42))
* **3259:** disable provider dropdown for public cloud product edit page ([0b9704e](https://github.com/bcgov/platform-services-registry/commit/0b9704e5ef573e34e36bb2e55f6318441c1166c2))
* **3511:** fix visual bug mantinie upgrage Budge component styles ([3245017](https://github.com/bcgov/platform-services-registry/commit/324501777c0c693ef693396f5c2029864019f8a3))
* **3641:** resolve a bug displaying multiple app versions in footer ([6c4380c](https://github.com/bcgov/platform-services-registry/commit/6c4380c6411a68d8c47c06e44b81b2a41716ce61))

### Docs

* **3621:** add documentation for onboarding and offboarding ([f841873](https://github.com/bcgov/platform-services-registry/commit/f84187397fd983d2d805d65facaa80f66083c081))
* **3639:** add documentation for rocketchat notifications ([f616cd5](https://github.com/bcgov/platform-services-registry/commit/f616cd5aca8a8b53254dcc47fd46bb291f298277))
* add guidelines for reviewing bot PRs ([9b1832f](https://github.com/bcgov/platform-services-registry/commit/9b1832fc3d596ec42e199e9f14a97f63d54f6983))
* **readme-modified:** update installation instructions ([67b1bad](https://github.com/bcgov/platform-services-registry/commit/67b1badb3f6c474b2e0e03f1bd707356b8a97a84))

### Refactors

* **3610:** organize type definitions ([d569886](https://github.com/bcgov/platform-services-registry/commit/d56988672a90a7af82c087e5463a11329350206b))
* **validation-schema:** organize schema definitions ([b7f7a82](https://github.com/bcgov/platform-services-registry/commit/b7f7a8256c98a96db2ef4da50176d9f320ef5985))
## [0.33.2](https://github.com/bcgov/platform-services-registry/compare/v0.33.1...v0.33.2) (2024-08-15)

### Features

* **2399:** implement code for BDD features, Create, Approve, Delete tests ([0b35e9a](https://github.com/bcgov/platform-services-registry/commit/0b35e9a568295c9a35b01e9dfb7c1f03e4499ac0))
* **3373:** Add Edit Request test and partial refactoring ([b27ccb8](https://github.com/bcgov/platform-services-registry/commit/b27ccb8032ee73c5f6ccf429f877614402cd7a21))
* **3502:** add public eMOU workflow diagram ([af36f3e](https://github.com/bcgov/platform-services-registry/commit/af36f3e51d4d4856db548dc474438f7776dc9208))

### Bug Fixes

* **3526:** Make Team Comments component number dynamic ([4328b76](https://github.com/bcgov/platform-services-registry/commit/4328b7608096765be068ae65feb611dd19071566))
## [0.33.1](https://github.com/bcgov/platform-services-registry/compare/v0.33.0...v0.33.1) (2024-08-07)

### Features

* **3472:** grant public cloud Azure provider access ([6593d35](https://github.com/bcgov/platform-services-registry/commit/6593d3553d333dc2f953aa02e56f9b9bdf002bab))

### Bug Fixes

* **3452:** grant public products review permissions properly ([8feb824](https://github.com/bcgov/platform-services-registry/commit/8feb8247c175a55a0916e9ede4717b7d3b207949))
* **3453:** display temporary badges and alerts ([bdc029b](https://github.com/bcgov/platform-services-registry/commit/bdc029b3fe8e128b131a51a366d491de7995f493))
## [0.33.0](https://github.com/bcgov/platform-services-registry/compare/v0.32.0...v0.33.0) (2024-08-01)

### Features

* **2759:** Add generic button component PoC ([1b872aa](https://github.com/bcgov/platform-services-registry/commit/1b872aafad806e85f6afb56efc28b5e863be6eb1))
* **2759:** add mantine color theme ([c9ff432](https://github.com/bcgov/platform-services-registry/commit/c9ff432e3d1415172ebb8d09c567c6c8a2536f90))
* **2759:** Relocate button ex., use generated colors, looping variants ([d2ae4e0](https://github.com/bcgov/platform-services-registry/commit/d2ae4e0e0eeb3a292d281fa84d85974749f6fb8b))
* **3077:** add Airflow DAG to handle delete requests ([69ae1af](https://github.com/bcgov/platform-services-registry/commit/69ae1af6f09968aaca1cbc4480a9ce60602ed15a))
* **3121:** add backend API endpints to support team service accounts ([c7a7857](https://github.com/bcgov/platform-services-registry/commit/c7a7857e7f48dffac33fa2406c7d96ada7b9728a))
* **3196:** add quota contact & justification inputs ([e38687f](https://github.com/bcgov/platform-services-registry/commit/e38687fccb1df7f8fe56dd3824de05c2d37657aa))
* **3196:** set request box to full width for size consistency ([2e00872](https://github.com/bcgov/platform-services-registry/commit/2e008720fd4db308c2c6006a7f691bbb0d09e06f))
* **3207:** display the number of comments on a request to admins ([5540242](https://github.com/bcgov/platform-services-registry/commit/554024273fb992ed424a063b332d4c9c1c3ab34b))
* **3242:** grant private admin to toggle temporary flags ([9e7ee5a](https://github.com/bcgov/platform-services-registry/commit/9e7ee5aac06389ed2b63f35c86da7b40f33736d7))
* **3242:** save temporary flag instantly when admin updates flag ([84f92dc](https://github.com/bcgov/platform-services-registry/commit/84f92dc3991d5355d76f2f5d4968fe6d69f73f04))
* **3252:** add cronjob to update Registry emails in Mailchimp ([adf68f8](https://github.com/bcgov/platform-services-registry/commit/adf68f8453ff1423bfbf558390452e83a02af98f))
* **3305:** add team API account page and functionalities ([691d5f6](https://github.com/bcgov/platform-services-registry/commit/691d5f6b180cc3505574b5e57a7488a58c021b2c))
* **3320:** add core helper function to create modals ([dff956e](https://github.com/bcgov/platform-services-registry/commit/dff956e6c4fff6851413f23e7ea5b04d1af84e98))
* **3332:** display email errors on the team account form ([4e8b5b0](https://github.com/bcgov/platform-services-registry/commit/4e8b5b04bc5a3e6fa85e0a328de562bb85bedd6e))
* **3332:** update API handler to accept team service account tokens ([8fce615](https://github.com/bcgov/platform-services-registry/commit/8fce61501866ed464eafe6737360e63638f312a1))
* **3372:** install Jinja2 into Airflow for email templating ([392465e](https://github.com/bcgov/platform-services-registry/commit/392465e8a38c082106872fe3290f576c70cce698))
* **3372:** send notifications to temporary products ([29de650](https://github.com/bcgov/platform-services-registry/commit/29de65098a04231b687ddfe0783aa03b3046c4f9))
* **3414:** add task schema and logic to backend ([04e4cfb](https://github.com/bcgov/platform-services-registry/commit/04e4cfb6a839d836804cbc2f8474d55e171b0b6a))

### Bug Fixes

* **3121:** fix typo to retrieve correct roles ([039f0ad](https://github.com/bcgov/platform-services-registry/commit/039f0ade30fed45ee1648b9ba07830d26eda73af))
* **3415:** sync contact dropdown when onBlur ([2515f99](https://github.com/bcgov/platform-services-registry/commit/2515f99a1b0b4396b7091d42f235c4c25a7dd48b))
* **3420:** display temporary product deletion date based on product ([94a5f85](https://github.com/bcgov/platform-services-registry/commit/94a5f85374d9f733cb067ea16d6fb4020bacc19f))
* main branch merge ([5482063](https://github.com/bcgov/platform-services-registry/commit/54820633d4e0d28c1682b0ae6c3679fcbdf70dcc))

### Refactors

* **3369:** add optional comments in request confirmation modals ([8a8961f](https://github.com/bcgov/platform-services-registry/commit/8a8961faadf4daf8191c70abe5d1c9c5bff3e4e3))
## [0.32.0](https://github.com/bcgov/platform-services-registry/compare/v0.31.2...v0.32.0) (2024-07-09)

### Features

* **2847:** check for license plate duplication in DB when creating ([fdc6e84](https://github.com/bcgov/platform-services-registry/commit/fdc6e84687cfdccd68113b62c23cb180f02c6257))
* **2959:** minimal e2e private cloud happy path test set ([ef9432d](https://github.com/bcgov/platform-services-registry/commit/ef9432dcd64f9dbcc48a75dd9444d3d275bca0dd))
* **2961:** add contact changes historical chart ([7869e76](https://github.com/bcgov/platform-services-registry/commit/7869e767f0943b1629bba981bed56314d43e6c70))
* **2961:** enable export options for contact changes chart data ([3e2baa9](https://github.com/bcgov/platform-services-registry/commit/3e2baa930b454c396f2baafd486e8bf8faa7cbfc))
* **2962:** add login event chart in analytics page ([039c9e6](https://github.com/bcgov/platform-services-registry/commit/039c9e6c8bfc57d5b180c264a138ae0412a79514))
* **3220:** update v1 API endpoints data & parameters ([0444e66](https://github.com/bcgov/platform-services-registry/commit/0444e66afc664e995990c1fbb43ff6a1725c182b))
* **3244:** add minimal happy path gherkin scenarios for public cloud request flow ([de5b5af](https://github.com/bcgov/platform-services-registry/commit/de5b5afaecae97c46b75da45726e3b1e15f99df4))
* **3296:** enhance search input clear button behaviour ([c597284](https://github.com/bcgov/platform-services-registry/commit/c597284a8ecf0e4b57a0e171b3328a7495c66eb5))
* add subscription to mlalchimp ([7072ad6](https://github.com/bcgov/platform-services-registry/commit/7072ad65af21ba34819fecedcb04415cf7a07538))
* add support phone number for private products ([c1dfa88](https://github.com/bcgov/platform-services-registry/commit/c1dfa88a968e46123fb564d4dc6b5fb8732789fb))
* add X button to clear search text field ([ffbf59a](https://github.com/bcgov/platform-services-registry/commit/ffbf59a56fefe96052c6c0e3ba8723ef1b641fc7))
## [0.31.2](https://github.com/bcgov/platform-services-registry/compare/v0.31.1...v0.31.2) (2024-06-25)

### Features

* **2961:** store product change metadata in DB ([1af2295](https://github.com/bcgov/platform-services-registry/commit/1af2295f4dd884057ce0aacfbcbaad05aa0f2e0a))

### Bug Fixes

* **3215:** correct the roles for product comments to add private admin ([0f10486](https://github.com/bcgov/platform-services-registry/commit/0f10486a501423de2473d0e1533aa75272a94a80))
## [0.31.1](https://github.com/bcgov/platform-services-registry/compare/v0.31.0...v0.31.1) (2024-06-25)

### Features

* **2961:** add a Make command to copy data from live environment ([901ba03](https://github.com/bcgov/platform-services-registry/commit/901ba03268eca72b00800a6b0622d0e034fbbc7e))
* **3145:** integrate the provisioner script into Airflow DAGs ([617d805](https://github.com/bcgov/platform-services-registry/commit/617d805d4f4fe95627946ebd1ed466ca714c4935))
* **3179:** add rich text editor to admin comments pages ([68691d9](https://github.com/bcgov/platform-services-registry/commit/68691d9cc149654ecd07a53c4d1e7980a06addc7))
## [0.31.0](https://github.com/bcgov/platform-services-registry/compare/v0.30.0...v0.31.0) (2024-06-24)

### Features

* **3034:** hide current resource info on non-editable form ([e85ef64](https://github.com/bcgov/platform-services-registry/commit/e85ef648eeda12c97d5aa6367189c6cb20e31864))
* **3046:** add API test script for private cloud product download ([5578c03](https://github.com/bcgov/platform-services-registry/commit/5578c0389f70fec4bc3ad1dc071c6f19bbcf45b7))
* **3046:** add API test script for private cloud product requests ([80e50d2](https://github.com/bcgov/platform-services-registry/commit/80e50d20a9147d7f4c1b3202910975bb0f97ea1a))
* **3047:** add API test scripts for public cloud routes ([a77fc65](https://github.com/bcgov/platform-services-registry/commit/a77fc65240650f5832ce4acfb8d95acdcbad9ec8))
* **3048:** add API test scripts for user service account endpoints ([be31521](https://github.com/bcgov/platform-services-registry/commit/be31521db0e7e582cde36ddc3f9fc050a291e85d))
* **3094:** display request box in public product table list ([0005186](https://github.com/bcgov/platform-services-registry/commit/00051868d993976f9d6ffb12a3c50ccba5ac3024))
* **provisioner:** add backend logic to backup provisioner callback (remove 'completed' attribute) ([dce3c8e](https://github.com/bcgov/platform-services-registry/commit/dce3c8ec4ed5660bb13810d3302dd82516309935))

### Bug Fixes

* **2889:** update data diff common function ([c4c48e0](https://github.com/bcgov/platform-services-registry/commit/c4c48e0f5945a585d1c8f0ee03c77f9b8aad3cc6))
* **2977:** update private cloud reject email to cover create request ([f8dc841](https://github.com/bcgov/platform-services-registry/commit/f8dc84195e240e8fd0b5961204cbbfb849589b8b))
* **3093:** add word wrap and character limit to description tool tips ([6b37fc2](https://github.com/bcgov/platform-services-registry/commit/6b37fc26d3464583f125c487a163e656ce3bec97))
* **3103:** give explicit view permission to ministry editor ([d5fe609](https://github.com/bcgov/platform-services-registry/commit/d5fe60946333454e3354e689c2d9a8f426a60971))
* **3174:** fix newlines in edit text area and refetching of edited comments ([33e68cf](https://github.com/bcgov/platform-services-registry/commit/33e68cf06d56c750841494ba116d3566a8850f11))
* show only requested environments budget ([32adb92](https://github.com/bcgov/platform-services-registry/commit/32adb92eea296a69911a2a39a27eb712c2c90d20))

### Refactors

* update landing page content ([193b33d](https://github.com/bcgov/platform-services-registry/commit/193b33d7ef62f04f5c637090fbdaefcb004389f1))
## [0.30.0](https://github.com/bcgov/platform-services-registry/compare/v0.29.1...v0.30.0) (2024-06-17)

### Features

* **3042:** add api token create & delete events ([7d5713e](https://github.com/bcgov/platform-services-registry/commit/7d5713e4fbb19877a04dbfacb03a7085f44ae3e1))
* **3042:** add event schema ([942bcac](https://github.com/bcgov/platform-services-registry/commit/942bcace8a8215d3bed2534bc9757c6dea0d6960))
* **3042:** add events on storing export products ([4c4684f](https://github.com/bcgov/platform-services-registry/commit/4c4684f0686ef407e621404781ec4c7085e22e36))
* **3042:** add login & logout events ([2c7fce4](https://github.com/bcgov/platform-services-registry/commit/2c7fce40f57cd9dd404a2e1b1d18ee5a83450d05))
* **3042:** add private & public request events ([86832d6](https://github.com/bcgov/platform-services-registry/commit/86832d646d5e308702dd74ddd398eb1cbfe472a5))
* **3042:** add private & public review events ([1fabe27](https://github.com/bcgov/platform-services-registry/commit/1fabe27df2ed636d4f8e8ccf821d6951cfabf2fe))
* **3042:** keep track of the last active datetime ([cd37498](https://github.com/bcgov/platform-services-registry/commit/cd37498091907d9d17edb730b367c20795679128))
* **3046:** add API test script for private cloud product search endpoint ([7456d80](https://github.com/bcgov/platform-services-registry/commit/7456d80e514996ae4a9452a3af82cde30b694fda))
* **3046:** add API test script for private cloud request search endpoint ([633660c](https://github.com/bcgov/platform-services-registry/commit/633660ce8f30ec34e3d67c565839898cffd41e87))
## [0.29.1](https://github.com/bcgov/platform-services-registry/compare/v0.29.0...v0.29.1) (2024-06-10)

### Features

* **3045:** add a func to create sample private cloud data ([3eab36d](https://github.com/bcgov/platform-services-registry/commit/3eab36d44334e3af9fde6a625d0edee844e17540))

### Bug Fixes

* **3061:** display cloud calculator correctly ([136ad72](https://github.com/bcgov/platform-services-registry/commit/136ad7286e66376152a570bb4d4e09bcd24c867b))
## [0.29.0](https://github.com/bcgov/platform-services-registry/compare/v0.28.0...v0.29.0) (2024-06-07)

### Features

* **3045:** encapsulate Next.js routes with parameters for reusability ([9153999](https://github.com/bcgov/platform-services-registry/commit/915399940ec23bf8b82af68f17214f7570b19c4e))

### Bug Fixes

* **3052:** add missing private cloud create requests ([fd8f9ba](https://github.com/bcgov/platform-services-registry/commit/fd8f9baa0bb90d5d30d077491b038f8e5ec8b17a))
## [0.28.0](https://github.com/bcgov/platform-services-registry/compare/v0.27.0...v0.28.0) (2024-06-05)

### Features

* **3001:** add service API endpoint to accept both ID and license plate ([6e7446f](https://github.com/bcgov/platform-services-registry/commit/6e7446f40e190ba37916167d512326f3c1cb5d8b))
## [0.27.0](https://github.com/bcgov/platform-services-registry/compare/v0.26.5...v0.27.0) (2024-06-05)

### Features

* **2808:** create Keycloak groups for AWS requests ([9d16fa7](https://github.com/bcgov/platform-services-registry/commit/9d16fa7652a779f2b1645b0eee8c869caf594935))
* **2958:** add frontend support for admin comments on requests ([8f6634f](https://github.com/bcgov/platform-services-registry/commit/8f6634f388f7a71c03cbc64882b40349a5469ee4))
* add all ministry specific roles ([e676af4](https://github.com/bcgov/platform-services-registry/commit/e676af43133ddc08813d23c035a6c057f8151674))

### Bug Fixes

* **2726:** add error handling and notifications for unauthorized product creation ([31a1979](https://github.com/bcgov/platform-services-registry/commit/31a1979c06f3fefef99be8db022cfad71e15cb71))

### Refactors

* **2596:** convert nats-provision into typescript ([2e5f1d1](https://github.com/bcgov/platform-services-registry/commit/2e5f1d120602b4890516d02dee2768422dbce708))
* **2808:** move Keycloak admin core as the common package ([7f88cd9](https://github.com/bcgov/platform-services-registry/commit/7f88cd9dac6f46203bac988b9cda44713df286b9))
* **2826:** deprecate react toastify and replace with mantine notifications ([156fbc1](https://github.com/bcgov/platform-services-registry/commit/156fbc18b5ac7648885e968db45a29fae47822a6))
## [0.26.5](https://github.com/bcgov/platform-services-registry/compare/v0.26.4...v0.26.5) (2024-06-04)

### Features

* **2596:** add Azure as the second public cloud provider option ([1409f5e](https://github.com/bcgov/platform-services-registry/commit/1409f5e651c623c14a5b23a49d6fb4c04a226ac9))
* **2596:** add Azure provider into public analystics dashboard ([9b6c628](https://github.com/bcgov/platform-services-registry/commit/9b6c6286f6266d559334e56c31a7e8732d97310d))

### Refactors

* **2808:** convert keycloak provision into typescript ([a546710](https://github.com/bcgov/platform-services-registry/commit/a546710fa7f08665aa2a210f5ad670fa47b2fee9))
## [0.26.4](https://github.com/bcgov/platform-services-registry/compare/v0.26.3...v0.26.4) (2024-06-03)

### Features

* **2914:** add provisioned date in request schemas ([dddd423](https://github.com/bcgov/platform-services-registry/commit/dddd423eff2969d70ad1e6c2dc8b31cc677fb77f))
* label for private product and request dashboards, is test filter for private requests ([59d8315](https://github.com/bcgov/platform-services-registry/commit/59d8315e603958f78782140bed50f0904c3ded7d))

### Bug Fixes

* run build error with no isTest for public cloud products ([e20f903](https://github.com/bcgov/platform-services-registry/commit/e20f903ccf3c6603f1738718f53f6a8d0372772b))

### Refactors

* **2032:** move security dashboard to root directory ([3f969f8](https://github.com/bcgov/platform-services-registry/commit/3f969f82f92b401ccfe7d0c84ff378141189cc20))
* **2404:** move service account verification logic into core ([288d0c6](https://github.com/bcgov/platform-services-registry/commit/288d0c6d13ed1550bc7083e416a06c94c245aff8))
* **2832:** rename created to created in request schemas ([051a8ac](https://github.com/bcgov/platform-services-registry/commit/051a8ac4da15d641654d8ff7f065d7e32194a2d9))
## [0.26.3](https://github.com/bcgov/platform-services-registry/compare/v0.26.2...v0.26.3) (2024-05-30)
## [0.26.2](https://github.com/bcgov/platform-services-registry/compare/v0.26.1...v0.26.2) (2024-05-30)
## [0.26.1](https://github.com/bcgov/platform-services-registry/compare/v0.26.0...v0.26.1) (2024-05-29)

### Bug Fixes

* **2844:** fix private cloud email bugs ([5f84b79](https://github.com/bcgov/platform-services-registry/commit/5f84b792ae34f8d59014f4f43d7690a6f9ddcfc1))

### Refactors

* **2832:** enable app eslint in pre-commit ([c8f753f](https://github.com/bcgov/platform-services-registry/commit/c8f753f4fc19b3ad426ac2d94b28fce984b75ff0))
* **2832:** move application codebase to app directory ([7f86231](https://github.com/bcgov/platform-services-registry/commit/7f86231e2ff4983b4bc0baea1c7c3e84fa11fd50))
* **ci:** separate build and test jobs for performance gain ([771b05b](https://github.com/bcgov/platform-services-registry/commit/771b05b0eef30a3052cfbc9a862cd4c5953fd492))
## [0.26.0](https://github.com/bcgov/platform-services-registry/compare/v0.25.0...v0.26.0) (2024-05-28)

### Features

* add test label, filtering, days until product deletion ([f8af1a8](https://github.com/bcgov/platform-services-registry/commit/f8af1a807aef73491c538b3bfa4a4344a7708d6e))
* **ui:** update header menu design ([c5a281f](https://github.com/bcgov/platform-services-registry/commit/c5a281f0824714cc3df6d520ee41c69a218f2178))

### Refactors

* **2778:** clean up icons ([09eba1e](https://github.com/bcgov/platform-services-registry/commit/09eba1e6d6120afa9999538ec058c3384117bb9f))
## [0.25.0](https://github.com/bcgov/platform-services-registry/compare/v0.24.6...v0.25.0) (2024-05-27)

### Features

* **2597:** add accounts section in public product page ([7a3815a](https://github.com/bcgov/platform-services-registry/commit/7a3815aa4ce378b16ef407ec9e872fa27a3bda5e))
* **2842:** add support for comments on request entity ([622e50a](https://github.com/bcgov/platform-services-registry/commit/622e50aa8735602c56fd8daa853e118d20bc61b4))
## [0.24.6](https://github.com/bcgov/platform-services-registry/compare/v0.24.4...v0.24.6) (2024-05-27)

### Features

* **2404:** add api account page with initial api endpoints ([ef7a74d](https://github.com/bcgov/platform-services-registry/commit/ef7a74d998b993ef46f59f94cb16837b3136e4f8))
* **2404:** create admin cli to manage api accounts via keycloak ([dc007e2](https://github.com/bcgov/platform-services-registry/commit/dc007e2ae8848353441d61c5ec8a86c06f2e4412))
* add isTest flag to private cloud product ([10e4b76](https://github.com/bcgov/platform-services-registry/commit/10e4b76ad8c5d646505daa5861c1a9e72f5aba78))
* add isTest flag to private cloud product ([5f3abb7](https://github.com/bcgov/platform-services-registry/commit/5f3abb707513629d1f99ef955895540b5e6d56de))
* add isTest flag to private cloud product and script add isTest field ([bfcfd77](https://github.com/bcgov/platform-services-registry/commit/bfcfd773ec890b1d53c2ab78330b8ab3df324874))
* update api account endpoint spec & doc ([29cdfbc](https://github.com/bcgov/platform-services-registry/commit/29cdfbc5cac74e1e8e2395258547066b79cbe8be))

### Bug Fixes

* display comments for admin only ([074fbe2](https://github.com/bcgov/platform-services-registry/commit/074fbe2eb4361bacb4a47f0ae322e220a14b894f))

### Refactors

* increase the request list fetch performance ([e2c815b](https://github.com/bcgov/platform-services-registry/commit/e2c815b849a20909f9b64e0a65063e576ba7b03c))
## [0.24.4](https://github.com/bcgov/platform-services-registry/compare/v0.24.3...v0.24.4) (2024-05-23)

### Bug Fixes

* check the provision status for create requests ([63b49fa](https://github.com/bcgov/platform-services-registry/commit/63b49faf3c93a5dc249719b70b257e4232ed230b))
## [0.24.3](https://github.com/bcgov/platform-services-registry/compare/v0.24.2...v0.24.3) (2024-05-23)
## [0.24.2](https://github.com/bcgov/platform-services-registry/compare/v0.24.1...v0.24.2) (2024-05-22)
## [0.24.1](https://github.com/bcgov/platform-services-registry/compare/v0.24.0...v0.24.1) (2024-05-21)

### Features

* display form errors via notifications ([cb25e36](https://github.com/bcgov/platform-services-registry/commit/cb25e36ed813dcc7dcc3a3de73e0ad3ccf130894))
## [0.24.0](https://github.com/bcgov/platform-services-registry/compare/v0.23.8...v0.24.0) (2024-05-21)

### Features

* **2309:** add home page ([2fbea77](https://github.com/bcgov/platform-services-registry/commit/2fbea778f7edb0681abe7175f6fdbfc3cd7e9bdf))
* **2698:** add an api endpoint to list all license plates ([3e13d88](https://github.com/bcgov/platform-services-registry/commit/3e13d8874b3ec7cb40964644c77a5e3f2393c684))
* add a common component CopyableButton ([4084eab](https://github.com/bcgov/platform-services-registry/commit/4084eabafa90fd45ca6b90fb3526233305857d0b))
* add a data migration script to populate update date ([3cd6458](https://github.com/bcgov/platform-services-registry/commit/3cd6458cea2f31566bb09abdb2211ef5962e2dff))
* add confirmation in checkbox component ([4c51117](https://github.com/bcgov/platform-services-registry/commit/4c511172d407a5856e825a9e6b9f55e84be7c34c))
* **ci-cd:** add RocketChat notification for successful prod deployment ([3353c86](https://github.com/bcgov/platform-services-registry/commit/3353c865e77a834beb8012a38262371fb175e08f))
* display product change table in request summary tabs ([bf383fb](https://github.com/bcgov/platform-services-registry/commit/bf383fb7b259b715fbe6792fca25c0c10cf14318))
* expand request pages ([0394b39](https://github.com/bcgov/platform-services-registry/commit/0394b3918f392d670ac26f80e018f19d37130b08))
* update dashboard top sections ([715dd72](https://github.com/bcgov/platform-services-registry/commit/715dd7278e6ff4f31cd6c91ad75a2d0f8ed9b068))
* use mail link in user card ([6cca8ef](https://github.com/bcgov/platform-services-registry/commit/6cca8ef8a3f7820038d514417d2d5e44a896f526))

### Bug Fixes

* **2813:** add dynamic numbering to Common Components section ([f124f60](https://github.com/bcgov/platform-services-registry/commit/f124f60cd30541b941a012a3b591a94939cbf3ee))
* **2835:** add dynamic wording for gold dr check box ([c996027](https://github.com/bcgov/platform-services-registry/commit/c99602704919576138d2933b511262f627fa9df8))
* display goto product link properly ([18f400b](https://github.com/bcgov/platform-services-registry/commit/18f400b0b7ad9c15f814b17c098042ad5198b46a))

### Refactors

* **2793:** cleanup table body components ([19c5706](https://github.com/bcgov/platform-services-registry/commit/19c5706b8c5f0fdd398a910e64bd8abff3f3f9be))
* organize tabs and data changes ([b46834b](https://github.com/bcgov/platform-services-registry/commit/b46834bd85c605ad302209b335b1437f1809301b))
* secure api endpoints with doc permissions ([5542b1f](https://github.com/bcgov/platform-services-registry/commit/5542b1fc13c0662abfdbd2354f3bf07797fecb4f))
## [0.23.8](https://github.com/bcgov/platform-services-registry/compare/v0.23.7...v0.23.8) (2024-05-15)
## [0.23.7](https://github.com/bcgov/platform-services-registry/compare/v0.23.6...v0.23.7) (2024-05-15)
## [0.23.6](https://github.com/bcgov/platform-services-registry/compare/v0.23.5...v0.23.6) (2024-05-15)

### Bug Fixes

* public cloud user-roles link ([fdf3924](https://github.com/bcgov/platform-services-registry/commit/fdf392487e75410885cad3098595f192a9d2de5f))
## [0.23.5](https://github.com/bcgov/platform-services-registry/compare/v0.23.4...v0.23.5) (2024-05-14)

### Features

* **2713:** update csv download file format ([c75084a](https://github.com/bcgov/platform-services-registry/commit/c75084a05edbf4439d6976b380d3ee44191da273))
* deploy m365 to dev ([0a868ea](https://github.com/bcgov/platform-services-registry/commit/0a868ea3d23663fdea472dd77b1e1dcf8ed28892))
* **QOL:** users can now view what permissions they currently have ([49d1097](https://github.com/bcgov/platform-services-registry/commit/49d109728d3c15023e060f193b1c1189cbb5cd15))
* **QOL:** users can now view what permissions they currently have ([7a702be](https://github.com/bcgov/platform-services-registry/commit/7a702be8f8f9a15f81bed3a5e91361ac778beb0d))
* **QOL:** users can now view what role they currently have via the drop down menu ([a723022](https://github.com/bcgov/platform-services-registry/commit/a723022462eb22e5d911073602cdf0c4712b2d89))
* replace classname to style for better performance ([30b9ae9](https://github.com/bcgov/platform-services-registry/commit/30b9ae9d60f27eeae60740f095a57a1abbd5be7d))
* upgrade m365 proxy server ([1beaa05](https://github.com/bcgov/platform-services-registry/commit/1beaa056b54162e6c896fee0df16c75689f3bbb3))

### Bug Fixes

* **emails:** create, edit, and delete request emails now mention who actioned the request ([6491147](https://github.com/bcgov/platform-services-registry/commit/6491147c6cf3d37cd24cdeca99f4ba14d0daccd8))
* send correct public cloud emails on request type ([eb169c0](https://github.com/bcgov/platform-services-registry/commit/eb169c062281238b09fca264be93abefd6470036))

### Refactors

* update request decision page url ([4ed8827](https://github.com/bcgov/platform-services-registry/commit/4ed8827e0e9032a4c231b3cde4818b29dbccd194))
* update request decision page url in public ([7176db3](https://github.com/bcgov/platform-services-registry/commit/7176db3dcd05b16b6a37c0de4d771db9c40d3d49))
* update request decision page url in public ([ef4b263](https://github.com/bcgov/platform-services-registry/commit/ef4b263b60c80b2bf0fe2ce686f62ba81f7ca660))
## [0.23.4](https://github.com/bcgov/platform-services-registry/compare/v0.23.3...v0.23.4) (2024-05-09)

### Bug Fixes

* add timestamp on resend/reprovision nats msg ([f924e1c](https://github.com/bcgov/platform-services-registry/commit/f924e1c8208003123d493b1cd1af498d1e024abf))
## [0.23.3](https://github.com/bcgov/platform-services-registry/compare/v0.23.2...v0.23.3) (2024-05-07)

### Refactors

* organize email templates in layout ([4c25af0](https://github.com/bcgov/platform-services-registry/commit/4c25af0fea3af3ab367f856c1f2365287ef0b4ac))
## [0.23.2](https://github.com/bcgov/platform-services-registry/compare/v0.23.1...v0.23.2) (2024-05-07)

### Features

* **2229:** separate provisioning of golddr cluster ([4665edd](https://github.com/bcgov/platform-services-registry/commit/4665edd53b2371a16dc32a7b1bf5938af5c75e5c))
* **2249:** add logger for backend ([013d3f3](https://github.com/bcgov/platform-services-registry/commit/013d3f3c029ba8ee9187dfc139a248d7771bd88f))
* **2556:** store user image in db ([9e47fe2](https://github.com/bcgov/platform-services-registry/commit/9e47fe2214c2357805b99a709edb20ad9f3b5289))
* **2645:** ignore Form validations on Delete Requests ([7d47d60](https://github.com/bcgov/platform-services-registry/commit/7d47d60964580b5d63e9c6c2a93356b91b332d3f))
* add externalLink generic component ([84259b3](https://github.com/bcgov/platform-services-registry/commit/84259b326e81e4a8ea024b36f112c2b0dd80c741))
* add generic checkbox component ([568c1c7](https://github.com/bcgov/platform-services-registry/commit/568c1c7f65b075cbcb28508b6de6b5ae9857be6d))
* add golddrEnabled field ([74c0c81](https://github.com/bcgov/platform-services-registry/commit/74c0c815ae610df07b109f6646af9a1d00e750cf))
* add mailLink generic component ([dbdd293](https://github.com/bcgov/platform-services-registry/commit/dbdd293ec551a1b442c8bbba12f93c8c7e02661b))
* add view history document permission ([c9de09e](https://github.com/bcgov/platform-services-registry/commit/c9de09e9159e9300bb46cb173c7176f69f4e0794))
* **comments:** added confirmation box for deleting a comment, and success toast ([5b263b7](https://github.com/bcgov/platform-services-registry/commit/5b263b7a45d4db2e958984152063e0e76342ba9f))
* **comments:** delete a comment through UI ([54b3dc3](https://github.com/bcgov/platform-services-registry/commit/54b3dc3093b48036c3010579c30b17bd2f83c201))
* **comments:** edit a comment through the UI ([d3705b4](https://github.com/bcgov/platform-services-registry/commit/d3705b4bf3715b69f6f372bad4f7a12646089fad))
* signout from keycloak along with app backend ([0efde47](https://github.com/bcgov/platform-services-registry/commit/0efde47710ac596cf868442a7589a8c556e8ba5d))
## [0.23.1](https://github.com/bcgov/platform-services-registry/compare/v0.23.0...v0.23.1) (2024-04-29)
## [0.23.0](https://github.com/bcgov/platform-services-registry/compare/v0.22.3...v0.23.0) (2024-04-29)

### Features

* **1954:** add client base page component ([b30a10f](https://github.com/bcgov/platform-services-registry/commit/b30a10f336fe64521323268880fd1a6c89a39c7f))
* **1954:** add server base page component ([361e705](https://github.com/bcgov/platform-services-registry/commit/361e705a1beec13524c4c6b851b03345bbea03e2))
* add generic modal component ([60102c4](https://github.com/bcgov/platform-services-registry/commit/60102c4ff758400776c8917d5996efe374420595))
* add generic select component ([ba2c722](https://github.com/bcgov/platform-services-registry/commit/ba2c7225940c3da8cc7555b027f3ac3378a043da))
* add generic table components ([4700591](https://github.com/bcgov/platform-services-registry/commit/47005911368ee035deb62ec8d7b36f4d06eee2df))
* add generic toggle component ([723400a](https://github.com/bcgov/platform-services-registry/commit/723400ab3350979b0140b4c92098a97b5729c9fc))
* add light & export buttons ([ba0d845](https://github.com/bcgov/platform-services-registry/commit/ba0d845237b32f6d8d4f0b8d0ac7f8e2669c06a9))
* add private products search/download api endpoints ([b6b4959](https://github.com/bcgov/platform-services-registry/commit/b6b4959f2f1723df2258dcfe720e5236e06314e0))
* **comments:** created stylized comment bubbles ([2b5e445](https://github.com/bcgov/platform-services-registry/commit/2b5e44533950475aef61ce205acad063fadac457))
* convert private list page to client rendering ([e190c98](https://github.com/bcgov/platform-services-registry/commit/e190c98de057bb8feec961b72c762a9ee5836fcb))
* convert private request list page to client rendering ([c612098](https://github.com/bcgov/platform-services-registry/commit/c61209815b4d988801568eaa4937dc6859d2dca3))
* convert public list page to client rendering ([d3f9ac7](https://github.com/bcgov/platform-services-registry/commit/d3f9ac787b3ba33cdf239af2303d4e3347e5ae0d))
* convert public request list page to client rendering ([8096eb7](https://github.com/bcgov/platform-services-registry/commit/8096eb70c8784f6fce38644849ffbb81013bd418))
* created stylized comments bubbles ([33bd1de](https://github.com/bcgov/platform-services-registry/commit/33bd1de439fc47ffe5c55ea8121efea55822dbfb))
* history tab and request page for public cloud ([#2544](https://github.com/bcgov/platform-services-registry/issues/2544)) ([402d470](https://github.com/bcgov/platform-services-registry/commit/402d4700f6451384adeaf6adcdb0e08337e0dc57))
* set user session timeout configuration ([e94b3a8](https://github.com/bcgov/platform-services-registry/commit/e94b3a86de75df289c83ae6eba1902a25c768a35))

### Bug Fixes

* comments box for rejection decision only ([2674a26](https://github.com/bcgov/platform-services-registry/commit/2674a26dd957ebfb5dbb040a324d142cb6ecff84))
* correct subject for admin edit request email ([051be5b](https://github.com/bcgov/platform-services-registry/commit/051be5b2dafdd666e80360be05789abd407011f0))
* **private-email:** admins now notified of a delete request ([51e2c27](https://github.com/bcgov/platform-services-registry/commit/51e2c2785ce65825ecdad184185582c16e4dcb6a))
* **private-email:** send delete approval email after provisioning has been complete ([258414f](https://github.com/bcgov/platform-services-registry/commit/258414fe35e331df8b5a1e72be2267c2c16ed5be))
* rejection email now has correct content according to docs ([5aea799](https://github.com/bcgov/platform-services-registry/commit/5aea79905161ce80a226f4910377022e2d1bde28))
* send correct emails given scenario, refactored approval email content ([907fcb2](https://github.com/bcgov/platform-services-registry/commit/907fcb2f87d95b1b41eeb26d6fd438526d561f2e))

### Docs

* **private-email:** update scenario 4 consistency ([3fd4d5e](https://github.com/bcgov/platform-services-registry/commit/3fd4d5e9f6bfa49b43fffee56d2bbd247cc05696))
* updated private cloud email scenarios documentation Scenario 2 ([bf81426](https://github.com/bcgov/platform-services-registry/commit/bf81426815a03636ef5197b1485ff31fb787c946))

### Refactors

* organize create routes based on restful spec ([6869424](https://github.com/bcgov/platform-services-registry/commit/6869424c964998198e74baf75d5d2ede73af46d2))
* organize frontend/backend routes ([083baea](https://github.com/bcgov/platform-services-registry/commit/083baeae3117ded63cb063b3dce63f9993b8b925))
* organize read/update routes based on restful spec ([13e2b55](https://github.com/bcgov/platform-services-registry/commit/13e2b551a31c587be626711c32b7fd5e68ac4917))
* re-organize other cloud routes ([915f3ef](https://github.com/bcgov/platform-services-registry/commit/915f3efe57ba3a8c8030be58b3db8741ae01858c))
* re-organize private cloud routes ([2cd3204](https://github.com/bcgov/platform-services-registry/commit/2cd3204af7df1b1cbe972fd4f02592bb249b922f))
* re-organize public cloud routes ([f7181c9](https://github.com/bcgov/platform-services-registry/commit/f7181c9ca2dbae08b3ce2ac09709d1f3c9a7a67b))
## [0.22.3](https://github.com/bcgov/platform-services-registry/compare/v0.22.1...v0.22.3) (2024-04-18)

### Features

* add comments by a textbox ([8afdf6e](https://github.com/bcgov/platform-services-registry/commit/8afdf6e72fa4684c48ee2545073c9b5ce743491e))
* added comments tab, display comments in UI ([06e2b45](https://github.com/bcgov/platform-services-registry/commit/06e2b45c7a4e34fc57185b027323345225ed1840))
* **frontend:** add buttons to copy licensePlate to clipboard ([6b5720a](https://github.com/bcgov/platform-services-registry/commit/6b5720a80bee5aae771a40f2c73772c06f455453))
* **frontend:** add buttons to copy licensePlate to clipboard ([d87f6ad](https://github.com/bcgov/platform-services-registry/commit/d87f6ad21431fbfc613bc2f0b88e5b5ede81b9ee))
* history tab mockup implemented ([#2498](https://github.com/bcgov/platform-services-registry/issues/2498)) ([164c68d](https://github.com/bcgov/platform-services-registry/commit/164c68d2c59dbac3aa98882a75f4d2373b1ab4e6))

### Bug Fixes

* add check for Decode JWT token header ([c197b8b](https://github.com/bcgov/platform-services-registry/commit/c197b8b3cb796aaa698601453f613d0540bd07c6))
* change permission for private cloud admin to see LAB clusters in drop down ([#2472](https://github.com/bcgov/platform-services-registry/issues/2472)) ([080a3c5](https://github.com/bcgov/platform-services-registry/commit/080a3c5b232a8f80c1b77425770bfb64ee2556be))
* check is Expense authority form is filled in for public cloud product before deletion ([#2454](https://github.com/bcgov/platform-services-registry/issues/2454)) ([abfddcc](https://github.com/bcgov/platform-services-registry/commit/abfddcceced0d7185a5b7eea7d5967896cc9be56))
* **frontend:** fix tooltip shown for multiple rows ([de800c0](https://github.com/bcgov/platform-services-registry/commit/de800c07836d383309a56e40e478ad9be9638162))
* hide comments section on prod ([53e7c10](https://github.com/bcgov/platform-services-registry/commit/53e7c10a8e32df4295127f6a43c1c3d36216ba43))
* layout now consistent with other tabs ([d603066](https://github.com/bcgov/platform-services-registry/commit/d6030666ce65327ad11203c5db2fcfa7e9c8ced5))
* switch permission from private to public admins ([#2462](https://github.com/bcgov/platform-services-registry/issues/2462)) ([ad57b60](https://github.com/bcgov/platform-services-registry/commit/ad57b6000b3cb6509373503af2c6141d352563a5))
* use useQuery, and useMutation for comments logic ([f2348e7](https://github.com/bcgov/platform-services-registry/commit/f2348e7b1ce7567df3af10701e531f8d2b3b2dde))
## [0.22.1](https://github.com/bcgov/platform-services-registry/compare/v0.22.0...v0.22.1) (2024-04-04)

### Features

* add updatedAt field to comments ([ed971c3](https://github.com/bcgov/platform-services-registry/commit/ed971c30118f052c1ef95cbd490ff284cc40c129))

### Refactors

* api handler, next response, param validation ([#2421](https://github.com/bcgov/platform-services-registry/issues/2421)) ([bf02663](https://github.com/bcgov/platform-services-registry/commit/bf026633042e50c2e3eab1bb287be10d7136d6af))
## [0.22.0](https://github.com/bcgov/platform-services-registry/compare/v0.21.0...v0.22.0) (2024-03-22)

### Features

* add reprovision endpoint along with resend ([08cbb54](https://github.com/bcgov/platform-services-registry/commit/08cbb540ce20e18ef8ce061339befd9958db1adb))
## [0.21.0](https://github.com/bcgov/platform-services-registry/compare/v0.20.2...v0.21.0) (2024-03-22)

### Features

* add re-provisioning function ([fb5b0d1](https://github.com/bcgov/platform-services-registry/commit/fb5b0d13eb78c9c98f4ef59de3d1518f7575eb3d))
* enhance data validation in v1 api endpoints ([bc7a275](https://github.com/bcgov/platform-services-registry/commit/bc7a2758b5ff1f142d04b25b24cc324e4ff52790))
* logic for delete comment by id api ([b9c99d0](https://github.com/bcgov/platform-services-registry/commit/b9c99d0e279de9ae5540ed8265ec4294fcd27432))
* logic for list all comments api ([d3fb8ee](https://github.com/bcgov/platform-services-registry/commit/d3fb8ee7277436c3b55569e4d5411e0af2b01933))
* logic for read comment by id api logic ([4167255](https://github.com/bcgov/platform-services-registry/commit/4167255c9a11e966085028090ad6c08ca2319090))
* logic for update comment by id api ([94e939b](https://github.com/bcgov/platform-services-registry/commit/94e939b3083affbdea6fdb4c795fc4c721a6c3ed))
## [0.20.2](https://github.com/bcgov/platform-services-registry/compare/v0.20.1...v0.20.2) (2024-03-22)

### Bug Fixes

* use auth server instead of auth base url ([44627e8](https://github.com/bcgov/platform-services-registry/commit/44627e8b114fc521610d9a6564c265cb452b413b))
## [0.20.1](https://github.com/bcgov/platform-services-registry/compare/v0.20.0...v0.20.1) (2024-03-21)

### Features

* **2320:** migreate gitops apis ([e4f60d1](https://github.com/bcgov/platform-services-registry/commit/e4f60d12b0226a581a89abf46015d5cf0e0563f8))

### Bug Fixes

* add get user by email ([#2353](https://github.com/bcgov/platform-services-registry/issues/2353)) ([8f2576c](https://github.com/bcgov/platform-services-registry/commit/8f2576c2aa6d184290db7b631d961659fe52778e))
## [0.20.0](https://github.com/bcgov/platform-services-registry/compare/v0.19.1...v0.20.0) (2024-03-21)

### Features

* add editor roles ([11dee64](https://github.com/bcgov/platform-services-registry/commit/11dee64c7293600d523edb6759d23217fb47c13a))
* add total quotas in csv exports ([82de485](https://github.com/bcgov/platform-services-registry/commit/82de4855edb031d2aca7d40b6dd4d9908b39acb1))
* create comment api ([be32408](https://github.com/bcgov/platform-services-registry/commit/be32408fe69d37370e2429ab96a912552300e9fd))
* sort functionality to public and private products and requests ([#2344](https://github.com/bcgov/platform-services-registry/issues/2344)) ([b514f85](https://github.com/bcgov/platform-services-registry/commit/b514f8544d9b309426adddcdc50da9cfadef67c4))
## [0.19.1](https://github.com/bcgov/platform-services-registry/compare/v0.19.0...v0.19.1) (2024-03-20)

### Bug Fixes

* fix data migration scripts ([6142afa](https://github.com/bcgov/platform-services-registry/commit/6142afa8b25beb1a1f96cecdc0f8ebac45824f45))
## [0.19.0](https://github.com/bcgov/platform-services-registry/compare/v0.18.1...v0.19.0) (2024-03-19)

### Features

* add data migration to populate missing fields ([ae02860](https://github.com/bcgov/platform-services-registry/commit/ae02860b47b9ef2cb1fead759945c1fdd55497fa))
* add ministry editor roles ([f450e58](https://github.com/bcgov/platform-services-registry/commit/f450e58691e142e085b4984aa248e382369eb015))
* add private & public roles in keycloak ([7e595b7](https://github.com/bcgov/platform-services-registry/commit/7e595b7bc011b63cfce114f5c3ccac347f9c563e))
* add vanity url into terraform production client ([#2293](https://github.com/bcgov/platform-services-registry/issues/2293)) ([5f57ea5](https://github.com/bcgov/platform-services-registry/commit/5f57ea54abe69781c4f4bfc5e714230092c92371))
* apply security layers on product list page ([cc46be9](https://github.com/bcgov/platform-services-registry/commit/cc46be9d6f980b5aabbbffc595ab77d777642620))
* lowercase user emails ([babd957](https://github.com/bcgov/platform-services-registry/commit/babd9573459d2fe57e1eedd3617c122f8087cfb6))

### Bug Fixes

* update missing updated_at ([f07f32d](https://github.com/bcgov/platform-services-registry/commit/f07f32dea3b88630e7cfa40a43cbc5287243c3bf))

### Refactors

* deprecate aggregate db query ([0a629e6](https://github.com/bcgov/platform-services-registry/commit/0a629e648a0007442904ae7e7c160f209b2c579f))
* enhance api handler types ([df9696a](https://github.com/bcgov/platform-services-registry/commit/df9696ae2cce185c359848ca043b37a6ab620a4c))
* enhance mock session generation ([0af738a](https://github.com/bcgov/platform-services-registry/commit/0af738a811b05cfb8a4f619c60a8b848590f5ff4))
* merge duplicate email users ([c984867](https://github.com/bcgov/platform-services-registry/commit/c984867448fc21f1a452e179214b6a17ca36071f))
* migrate data to update old data ([05c2932](https://github.com/bcgov/platform-services-registry/commit/05c29327d81007bcec2dab061f33328a0d053f95))
* optimize codebase according to roles & permissions ([4feacbd](https://github.com/bcgov/platform-services-registry/commit/4feacbd867fce3cfc03055275af8daf11ff88109))
* optimize delete api endpoints ([970ac90](https://github.com/bcgov/platform-services-registry/commit/970ac9015db6189cfb7dbd60dbb60b374b2f708e))
## [0.18.1](https://github.com/bcgov/platform-services-registry/compare/v0.18.0...v0.18.1) (2024-03-14)

### Features

* **analytics:** filter private cloud requests by prod productions ([1158948](https://github.com/bcgov/platform-services-registry/commit/11589481f1293b9c225bbc1d39e671380835be99))

### Bug Fixes

* add user aws roles issue, hide histroy tab from prod ([#2279](https://github.com/bcgov/platform-services-registry/issues/2279)) ([35c1caf](https://github.com/bcgov/platform-services-registry/commit/35c1cafa54752623b42baf9600697a1b4875c415))

### Docs

* update db backup steps ([c2ffe13](https://github.com/bcgov/platform-services-registry/commit/c2ffe1333cc203975e8cec90b30b9428c50ee784))
## [0.18.0](https://github.com/bcgov/platform-services-registry/compare/v0.17.0...v0.18.0) (2024-03-13)

### Features

* add update-db make script ([b485016](https://github.com/bcgov/platform-services-registry/commit/b4850167272bcd5d7add2d61962629452acaabb1))
* restrict certain special characters from entering in public project name ([d938ca9](https://github.com/bcgov/platform-services-registry/commit/d938ca976aa8e2754462660af008c0ae5c7b440c))
* setup restful api for comments ([c373319](https://github.com/bcgov/platform-services-registry/commit/c373319d2465e48ba34fd2b157865f63487c2ea6))

### Bug Fixes

* fix issue with deletion provisioned email for public cloud ([#2267](https://github.com/bcgov/platform-services-registry/issues/2267)) ([ae056b1](https://github.com/bcgov/platform-services-registry/commit/ae056b14ed9457d79a146d0145372b2eff2a2eb1))
* resolve issues when deleting projects ([c57986c](https://github.com/bcgov/platform-services-registry/commit/c57986cf2feced45e02912883380ea45f773bb7e))
## [0.17.0](https://github.com/bcgov/platform-services-registry/compare/v0.16.0...v0.17.0) (2024-03-07)

### Features

* **1733:** Comment model is now PrivateCloudComment ([eae6428](https://github.com/bcgov/platform-services-registry/commit/eae64281df2dfd2826277d41484cc5455712cc24))
* **1733:** more meaningful name + formatting ([9b37f88](https://github.com/bcgov/platform-services-registry/commit/9b37f881b7809d7eda8435961a9992f952e8c177))
* **2110:** add portfolio per ministry pie charts in public cloud ([2008ba7](https://github.com/bcgov/platform-services-registry/commit/2008ba7e8998748b42dc4c1d300e3df7d766b93b))
* add approver in keycloak terraform ([3d67e59](https://github.com/bcgov/platform-services-registry/commit/3d67e5919ef2ccc66d4bc474288a5fe25adff427))
* add check for ag ministries ([#2148](https://github.com/bcgov/platform-services-registry/issues/2148)) ([7ac3873](https://github.com/bcgov/platform-services-registry/commit/7ac3873a416123aa45eb7a6faa30d36c6ceb3610)), closes [#2154](https://github.com/bcgov/platform-services-registry/issues/2154)
* add data migrations workflow ([9d77841](https://github.com/bcgov/platform-services-registry/commit/9d7784184fdcb0d643e47de687e184efc4bef9e4))
* add expense authority for public cloud product ([#2192](https://github.com/bcgov/platform-services-registry/issues/2192)) ([fdb2a6c](https://github.com/bcgov/platform-services-registry/commit/fdb2a6cff92a3f51344b2238301adf75d9935758))
* add housing ministry into AG alliance list ([896f552](https://github.com/bcgov/platform-services-registry/commit/896f55239cf33f2200831c42191f3f78c7e0f6db))
* add knip and removed unused ([bbcd3f5](https://github.com/bcgov/platform-services-registry/commit/bbcd3f5aebf579f1587696c5c666d2fa76db9d50))
* add mock-up provisioner in local env ([176887c](https://github.com/bcgov/platform-services-registry/commit/176887cd8f0ea1e4ed696bf98ad9ff1f3efe1740))
* add request comment in public cloud ([a1a92b8](https://github.com/bcgov/platform-services-registry/commit/a1a92b8ff3db85ea15c5609d89710144e3e4feb7))
* add top level roles in session ([efffb4b](https://github.com/bcgov/platform-services-registry/commit/efffb4ba4e93e6533fdd871ae00ff61a6884f22d))
* clean up ms query data ([384dcd3](https://github.com/bcgov/platform-services-registry/commit/384dcd394c41551c8cac39add6c205a915f599fb))
* comment model schema w/ reactions ([cadfcb9](https://github.com/bcgov/platform-services-registry/commit/cadfcb9b9e951632cec1c2c3ebd6028993731df0))
* deploy mock nats server in dev environment ([33dcb28](https://github.com/bcgov/platform-services-registry/commit/33dcb2866ebf282aad8b86bd3e58dee357eee062))
* display IDIR, UPN in user search ([640af7a](https://github.com/bcgov/platform-services-registry/commit/640af7a88c300a2437b0d8740627f002814a460b))
* enhance analytics pages ([351284f](https://github.com/bcgov/platform-services-registry/commit/351284fe7ee140cf4365d62decdad4a6599239b2))
* rename comment fields ([f262d56](https://github.com/bcgov/platform-services-registry/commit/f262d56675eb250144448334c30c4637776890aa))
* rename public comment fields ([f39acc6](https://github.com/bcgov/platform-services-registry/commit/f39acc6aed869bcbd693e2d184abe3a74b81abb9))
* separate private & public nats endpoints ([22b9ffb](https://github.com/bcgov/platform-services-registry/commit/22b9ffbc300e953b415fd98fe6535653dfc31fde))
* sort products by updated dates ([1d0ef14](https://github.com/bcgov/platform-services-registry/commit/1d0ef1444357bfd8f30dc4d8f99cebaf54d0f212))
* upsert users when users assinged for products ([873d05f](https://github.com/bcgov/platform-services-registry/commit/873d05fb3814d9475995a9199d528585aff5fb38))

### Bug Fixes

* **1733:** fixed build error in seed ([14f9f0c](https://github.com/bcgov/platform-services-registry/commit/14f9f0c5bfc157165028a17678aa82fd2d38f5c6))
* 2 comments are created per project ([fec97d8](https://github.com/bcgov/platform-services-registry/commit/fec97d84717f10edf7f2078d5bd1ed98729110a7))
* **2003:** various small visual bugs ([84013fb](https://github.com/bcgov/platform-services-registry/commit/84013fb7c8863bad2742388d83c407ba0e5b4d13))
* ensure delete provision falg the product as inactive ([e42b9a1](https://github.com/bcgov/platform-services-registry/commit/e42b9a1f47b2e0272edc068bb3ff793296320051))
* resolve issue on showing deleted products ([9da0da7](https://github.com/bcgov/platform-services-registry/commit/9da0da77bb2574651f45ad1da828558a8acc0d24))
* return modal + hosting tier info for users ([f552a8d](https://github.com/bcgov/platform-services-registry/commit/f552a8d36493dbbac0dced1fcf367b7037faa405))

### Docs

* add email scenarios for private cloud ([2d78021](https://github.com/bcgov/platform-services-registry/commit/2d78021c4d39e70d6d9087f278064eabcc23ceba))
* add email scenarios for public and private cloud ([15908ee](https://github.com/bcgov/platform-services-registry/commit/15908ee393d744a5dd5f657d783a1110b4eb7e1f))
* add tab in the first paragraphs ([52c9656](https://github.com/bcgov/platform-services-registry/commit/52c9656f666013a3e878512744a00ac2f7e2e006))
* update README.md ([8a5b0f6](https://github.com/bcgov/platform-services-registry/commit/8a5b0f6849b1939fd3bbaf8e56373733f421fa85))
## [0.16.0](https://github.com/bcgov/platform-services-registry/compare/v0.15.0...v0.16.0) (2024-02-13)

### Features

* add ACS tasks in upper environments ([5ad6063](https://github.com/bcgov/platform-services-registry/commit/5ad606375fce5151a00c08b47c1acbf95637e99a))
* add bash linter & formatter ([1d31993](https://github.com/bcgov/platform-services-registry/commit/1d319930e40f4ab79ab1fe3bee09b68f6ffeef15))
## [0.15.0](https://github.com/bcgov/platform-services-registry/compare/v0.13.0...v0.15.0) (2024-02-09)

### Features

* display URL sources in sonar scan results ([19dbe22](https://github.com/bcgov/platform-services-registry/commit/19dbe2218775fcb1c3cd830bce6a16a55b597dfa))

### Bug Fixes

* wording, and admin delete email ([4e89814](https://github.com/bcgov/platform-services-registry/commit/4e89814dc1c37f6f654b06cdf851f0b5caf28585))
## [0.13.0](https://github.com/bcgov/platform-services-registry/compare/v0.12.0...v0.13.0) (2024-02-07)

### Features

* search github urls from acs image build metadata ([07edb45](https://github.com/bcgov/platform-services-registry/commit/07edb4525be95de01dcfb82220c7f03b28a88646))

### Bug Fixes

* **1680:** fix comments in emails ([99c0eb7](https://github.com/bcgov/platform-services-registry/commit/99c0eb7a72c3078a62727b139eddd474fb0cced1))
## [0.12.0](https://github.com/bcgov/platform-services-registry/compare/v0.9.1...v0.12.0) (2024-02-06)

### Features

* **1915:** add acs airflow dag ([e4f9053](https://github.com/bcgov/platform-services-registry/commit/e4f9053be25c42954c4f357b041c38f7bce9f50e))
* **1916:** add security dashboard acs views ([97a6c90](https://github.com/bcgov/platform-services-registry/commit/97a6c90e7ea40e03aaa977401d30a6c5b48752bd))
## [0.9.1](https://github.com/bcgov/platform-services-registry/compare/v0.9.0...v0.9.1) (2024-01-30)

### Features

* **1865:** apply KC resources changes on pipeline ([28f18f5](https://github.com/bcgov/platform-services-registry/commit/28f18f5564d1c27d11f1a10d4191e028e8d327d5))
* add sysdig alerts with terraform ([effd21b](https://github.com/bcgov/platform-services-registry/commit/effd21b1d6ec9a09faa14ed9dc4c1a64283a484a))
* delete request email for admins for public cloud ([76e30bc](https://github.com/bcgov/platform-services-registry/commit/76e30bc7c9605719f6dd1005547bc62b8c8db5c3))
* edit request now edit summary for public cloud ([053d991](https://github.com/bcgov/platform-services-registry/commit/053d991c7c98f92a6fca1871d54a0e15b8d1401b))
* move env variables into config file ([8fd7681](https://github.com/bcgov/platform-services-registry/commit/8fd7681543b766edefedfa6bc4a3081e0e8b0a28))
* only allow github bcgov organization repos ([4641551](https://github.com/bcgov/platform-services-registry/commit/4641551cae514d636836513cf90ec29c845f168b))
* **secdash:** order list by scanned date ([465b262](https://github.com/bcgov/platform-services-registry/commit/465b262803ee50d1fb1b996b2b0c32a94c627cd1))
* skip sonarscans if repo has no changes ([65220db](https://github.com/bcgov/platform-services-registry/commit/65220db73d72701074a931762770dbe1eb348ee6))
* **sysdig:** add sysdig alerts for upper environments ([7cb61cb](https://github.com/bcgov/platform-services-registry/commit/7cb61cb89a7c1273f2e0aa01feaaeba3b97f2222))
* updated wording of edit summary ([0d24dc7](https://github.com/bcgov/platform-services-registry/commit/0d24dc719e7c8924cb316cf891916d2ef59ebf99))

### Bug Fixes

* resolve version upgrade issue ([15da9ac](https://github.com/bcgov/platform-services-registry/commit/15da9ac73d554eb8cb785402b7596a56fbde844b))
* use session.roles instead of session.user.roles ([9a79b0a](https://github.com/bcgov/platform-services-registry/commit/9a79b0a0f2f8ab314bd8628fca3ffc8e9af53e60))

### Docs

* update sysdig terraform docs ([f597ae6](https://github.com/bcgov/platform-services-registry/commit/f597ae6f316f5d3c847916b49321e0e64bfe843e))
* update team conventions ([d629672](https://github.com/bcgov/platform-services-registry/commit/d6296723bd7917f197ec8cb291d0a8bb6c9b1dcd))
## [0.9.0](https://github.com/bcgov/platform-services-registry/compare/v0.7.0...v0.9.0) (2024-01-17)

### Features

* add security scan results tabs ([99d5151](https://github.com/bcgov/platform-services-registry/commit/99d5151a73a900a5589aeffd6540d41b7f4c03c5))
* add sonarscan result page ([ab52b3a](https://github.com/bcgov/platform-services-registry/commit/ab52b3acbe05b9cd489f2d7b22d70939b10eeb2e))
* add version # in footer ([2eff74f](https://github.com/bcgov/platform-services-registry/commit/2eff74f7ad2b32d3fc72036f9796449a56f2cad7))

### Bug Fixes

* BudgetChanges logic for PublicEdit ([07d4263](https://github.com/bcgov/platform-services-registry/commit/07d42637b64adc600adfd351c8d9011b78fba4a1))
* email formatting and email changes ([907791a](https://github.com/bcgov/platform-services-registry/commit/907791a9aa06c093c6badd9b43b34d340b4604f7))
* provider details component now completed ([c8789c1](https://github.com/bcgov/platform-services-registry/commit/c8789c112f0163ae4a0c4889f09f9fa8f42f4ea7))
* wording ([e9dc830](https://github.com/bcgov/platform-services-registry/commit/e9dc830e2255cf7ff2a2354f4dc1dfb29fabb8f3))
* wording, formatting, links ([3a72d78](https://github.com/bcgov/platform-services-registry/commit/3a72d786193b309ef44e656d602c1dc819e18988))
## [0.7.0](https://github.com/bcgov/platform-services-registry/compare/v0.5.0...v0.7.0) (2024-01-16)

### Features

* **1728:** add security tab layout ([3271fd8](https://github.com/bcgov/platform-services-registry/commit/3271fd854ef661cf024505604608171d5cf45f39))
* **1728:** update security - repository tab ([7cfb2f8](https://github.com/bcgov/platform-services-registry/commit/7cfb2f814b00545160c525d191a3c3f48d5821da))
* add custom SonarQube scan Dockerfile with entrypoint ([68796d4](https://github.com/bcgov/platform-services-registry/commit/68796d4217ad96a77a0936a35b25892ec476a1ab))
* add security service layer for privateCloudProjectZapResult ([f62a094](https://github.com/bcgov/platform-services-registry/commit/f62a094658564fcf2742fe2ac4890a78c3c9f725))
* add zap results page ([c03d8b9](https://github.com/bcgov/platform-services-registry/commit/c03d8b910012a517c4f6b8857e8ad16f36a75250))
* AlertBox modal for handling confirmation messaages and alerts ([0a8869e](https://github.com/bcgov/platform-services-registry/commit/0a8869e6b6863342893f5c5cbe1d489c3301485e))
* allow idir login option only ([c013d44](https://github.com/bcgov/platform-services-registry/commit/c013d44ce061d53c262e0c20998177cdce0bf0e4))
* **sonarscan:** update static analysis scheduler task ([6f3379b](https://github.com/bcgov/platform-services-registry/commit/6f3379b2f72b5dc1c0c1b2137f6164070ebd7c7d))
* update ministry when user logs in ([bd70335](https://github.com/bcgov/platform-services-registry/commit/bd70335e7c2985663f2358341faae0ed2c51b5b6))
* update security layer ([a5cd797](https://github.com/bcgov/platform-services-registry/commit/a5cd797371fde64e8ae5905bd258125f42878514))
* updated favicon ([2795294](https://github.com/bcgov/platform-services-registry/commit/27952947c5f07888bb6117757c3b36ad3162d260))

### Bug Fixes

* add decimal values in budget field ([9677b39](https://github.com/bcgov/platform-services-registry/commit/9677b39da91544a35f17a55462a911fe751b0f9e))
* added link to quota increase process ([53be5c1](https://github.com/bcgov/platform-services-registry/commit/53be5c13bdf5a822d60865277f355eab50373b99))
* confirm box and isdirty submission for secondary lead form ([7c7605f](https://github.com/bcgov/platform-services-registry/commit/7c7605f759b02f145e8d5c92995c90322403cb9d))
* handle non-string search values ([9d3fdee](https://github.com/bcgov/platform-services-registry/commit/9d3fdeef3d5b4ee164bb3f32af67baed72685237))
* modals now display correct info given the context ([9a0e452](https://github.com/bcgov/platform-services-registry/commit/9a0e45274aa7c7a408d168254e6acda8704e299f))
* redundant curly brackets ([21c9171](https://github.com/bcgov/platform-services-registry/commit/21c91713e75630f8912cf3eb7e0251759a75b149))
* removed unused import ([e7b7760](https://github.com/bcgov/platform-services-registry/commit/e7b7760938e285053d15013d2ad8dd520a94a328))
* use idir as the single IDP ([49bd5f3](https://github.com/bcgov/platform-services-registry/commit/49bd5f36fac1928454f3334e9fbf209a6d8faf3a))
## [0.5.0](https://github.com/bcgov/platform-services-registry/compare/v0.4.0...v0.5.0) (2023-12-27)

### Features

* add api wrapper ([9c30b00](https://github.com/bcgov/platform-services-registry/commit/9c30b00e88d4148a83383b27c1cc2c75c8099b8e))
* add db backup cronjob ([75fbd3a](https://github.com/bcgov/platform-services-registry/commit/75fbd3a76be3767ebd83e86a8462fe1ea8988a6d))
* add helm chart for airflow deployment ([7cf85e1](https://github.com/bcgov/platform-services-registry/commit/7cf85e1ee2e34bb139ebad46e2fd51cc57b58eec))
* add prisma extension to apply security layer ([23c6d0f](https://github.com/bcgov/platform-services-registry/commit/23c6d0f9d7848780cb7edc1fce9a680bfe5ac875))
* add prisma extension to apply security layer ([ad2a8f1](https://github.com/bcgov/platform-services-registry/commit/ad2a8f13f6e8fffd998e07ea456cea90b6cc2d33))
* add wirte base filter in security layer ([6b9a120](https://github.com/bcgov/platform-services-registry/commit/6b9a12048dab5dcdda9f96623e66957a11f811ed))
* add zap vulnerability scanning airflow dag ([e2e8a5f](https://github.com/bcgov/platform-services-registry/commit/e2e8a5ffdbc5eb6f3daab29ade2eead1b7bc593d))
* create config.ts for common variables ([5d0fb96](https://github.com/bcgov/platform-services-registry/commit/5d0fb969b3426a6d2db7324ce428cd8f59b4632a))
* csv export with filtering ([6a23ebd](https://github.com/bcgov/platform-services-registry/commit/6a23ebdba2052bda96574699768634a96658bd14))
* enhance eslint rules ([4f17273](https://github.com/bcgov/platform-services-registry/commit/4f1727382c4da528d3bfaabd30caf8a43bd20552))
* enhance session context in higher level ([99c8929](https://github.com/bcgov/platform-services-registry/commit/99c8929987acf0af20e83b4ad22574ce055578a3))
* new kc clients for new UI ([9b728da](https://github.com/bcgov/platform-services-registry/commit/9b728dab911913078bbc3cd54019c12423d2dfb2))
* new modal for approve/deny an edit request. ([3cbfbb9](https://github.com/bcgov/platform-services-registry/commit/3cbfbb905217541c3a0a9e9e471cb94630a4a17d))
* publish security dashboard related images ([1527f54](https://github.com/bcgov/platform-services-registry/commit/1527f549b86c6a5a366da5ccac9013e7fd0943d4))
* show inactive projects/requests in private cloud ([5c68075](https://github.com/bcgov/platform-services-registry/commit/5c680757fc4fa168875ac0ea01e7e1211231e65e))
* toggle changes depending on requests/products ([6e12d44](https://github.com/bcgov/platform-services-registry/commit/6e12d448ba097071d5ff02768265d0ae339fc48b))
* toggle for public cloud ([39e59e2](https://github.com/bcgov/platform-services-registry/commit/39e59e2c939c622e6a44e6962a059fda377bc005))
* update react-email doc ([68a8baa](https://github.com/bcgov/platform-services-registry/commit/68a8baa4b2d072161a66fd600c7fc3d636ff0755))
* updated favicon ([524b214](https://github.com/bcgov/platform-services-registry/commit/524b214d1a95d13a89b088982eba543ab1a025a8))

### Bug Fixes

* .react-email in .gitignore ([697b5d9](https://github.com/bcgov/platform-services-registry/commit/697b5d9aa3b8f289723da7bcc6d18ee66d279338))
* border not showing in email header ([be75fdb](https://github.com/bcgov/platform-services-registry/commit/be75fdb4a3215b4087a1717c95bf2fd429328444))
* capitalized rejection ([aa883ef](https://github.com/bcgov/platform-services-registry/commit/aa883efa355d3fea4303580d74db0f22040c7a66))
* change logic to handle if active != false or true ([7419d52](https://github.com/bcgov/platform-services-registry/commit/7419d5296f6ef71fbbfe3929ca311ce5624ffab0))
* corrected download button on public-cloud ([11bb232](https://github.com/bcgov/platform-services-registry/commit/11bb23221494b9eead9d3003afe1fb32c7fe03e4))
* fix wording in emails ([ead0ccd](https://github.com/bcgov/platform-services-registry/commit/ead0ccd7e6a5fedd9daa7d5ddf42ac9677b24f6d))
* fix wording in emails ([7f6b1c5](https://github.com/bcgov/platform-services-registry/commit/7f6b1c58ea45f6857628fbf3d0d8d67eadd700dc))
* prefix applies to sendEmail level ([f946581](https://github.com/bcgov/platform-services-registry/commit/f9465816dba4dc7809b2ffb757ab3d7e009bc30c))
* react-email misspell ([bcde965](https://github.com/bcgov/platform-services-registry/commit/bcde9654a93955bcd343a32556757b845ad54d30))
* remove commented out lines ([8debf21](https://github.com/bcgov/platform-services-registry/commit/8debf2158a7e1a27713b9f8922b4a945d5b92f70))
* rename rejection to denial, fix comment modals ([fade899](https://github.com/bcgov/platform-services-registry/commit/fade899d187d46f4eb2e2578c86e68442a0a7f49))
* rename variable name ([7ce297e](https://github.com/bcgov/platform-services-registry/commit/7ce297e0b21fd0d2cf0978d51159eec36969bf52))
* resolved build error for download button behavior ([06b0e03](https://github.com/bcgov/platform-services-registry/commit/06b0e0311cd06acf5a36c9c6862ffbaae62778c1))
* return modal displays note only if its public-cloud ([28f699e](https://github.com/bcgov/platform-services-registry/commit/28f699e96d6653d9a15031de5976903738cddd46))
* update .gitignore for react-email ([b939026](https://github.com/bcgov/platform-services-registry/commit/b939026cabb1f1f2563a84078803bd34f420f61b))
* update db backup deployment config ([69f6255](https://github.com/bcgov/platform-services-registry/commit/69f6255e53eab34294c501446e29f4961a0e8749))
* update wording for rejection emails ([3c03729](https://github.com/bcgov/platform-services-registry/commit/3c03729391708afae54810e1473329dbbd1e6cba))
* updated emailHandler to grab value from config.ts ([b2786d5](https://github.com/bcgov/platform-services-registry/commit/b2786d50ef5aa8fa1be9e2ad5344b9eb854baf9f))
* wording on privatecloud modal and links in modals ([a741c7c](https://github.com/bcgov/platform-services-registry/commit/a741c7cfdc39a48b65d30d89e050b9a446cbce0d))
* wording on privatecloud modal and links in modals ([584d176](https://github.com/bcgov/platform-services-registry/commit/584d1764a1e093cca76416847349fa1fe02b1d20))

### Docs

* add database documents ([91e367c](https://github.com/bcgov/platform-services-registry/commit/91e367c6333e55a3b2fbc943b0ad051de6fe3c36))
## [0.4.0](https://github.com/bcgov/platform-services-registry/compare/v0.3.0...v0.4.0) (2023-11-28)

### Features

* add db migration container and build pipeline ([14d8e02](https://github.com/bcgov/platform-services-registry/commit/14d8e02cbae6b291fabbc21644229812e5c7d2fa))
* add deply dispatch pipeline ([80c6e61](https://github.com/bcgov/platform-services-registry/commit/80c6e616a5d75d36059f073c46a2cb3244955f77))
* add global api response handler ([19ff4ea](https://github.com/bcgov/platform-services-registry/commit/19ff4eafaa2ef21fc4287d733e92339cd89a6e97))
* add ministry role access logic ([#1376](https://github.com/bcgov/platform-services-registry/issues/1376)) ([88308c3](https://github.com/bcgov/platform-services-registry/commit/88308c3e8eb12a5cfd157c8cc4c19d1e0258d08f))
* comments passed from modal to api ([7cbc45b](https://github.com/bcgov/platform-services-registry/commit/7cbc45bee70ba3d7180c17e887f0a00dc42a4aa0))
* editRequest email template ([fcf5b99](https://github.com/bcgov/platform-services-registry/commit/fcf5b996241472d8cdd0f99784dc8fc0169e7f9a))
* install mongodb via helm charts ([d668014](https://github.com/bcgov/platform-services-registry/commit/d6680145e630419144bc1025d2a3bdea849c3355))
* set timeout for ches email requests ([a2a0e3d](https://github.com/bcgov/platform-services-registry/commit/a2a0e3d587fd29b19b1910ae2823c8f1afb34e10))
* update edit request emails to lookup quota ([8dfd2f2](https://github.com/bcgov/platform-services-registry/commit/8dfd2f24709bd9431f846c23cf27edbd1ff6af67))

### Bug Fixes

* made comment modal less confusing ([33b9ddf](https://github.com/bcgov/platform-services-registry/commit/33b9ddfa713695cc1734e342c461d3b800a463ed))
* remove redundant tailwind imports ([08c68b7](https://github.com/bcgov/platform-services-registry/commit/08c68b79b87a513bd1da6419b80c9d1ab8be2ded))
* remove tailwind from newRequest email ([ee094bd](https://github.com/bcgov/platform-services-registry/commit/ee094bdb3805a4c3d7027faefe928f01b2f22e38))
* revert downgrade on faker ([bf5d4fc](https://github.com/bcgov/platform-services-registry/commit/bf5d4fc655e90663b681a8f1f2357834c9bc19e2))
* update react-emails/tailwind ([ac0ba1c](https://github.com/bcgov/platform-services-registry/commit/ac0ba1c1aa194d19dd46d6a9cc786662d49f52ce))
* update style for editRequest ([40c3dc9](https://github.com/bcgov/platform-services-registry/commit/40c3dc95247bf6d981e9a06074f44c8d951abc73))
* used lodash for comparePorjects, removed EditRequest modal to different pr ([9a30489](https://github.com/bcgov/platform-services-registry/commit/9a304892e80fd0710cea8a2f3bfb5eefb7cd57e1))

### Docs

* add git tips ([c27f70c](https://github.com/bcgov/platform-services-registry/commit/c27f70c44f077a01958f049028f7ab97bf0c1c82))
* add security dashboard POC result ([bd691d6](https://github.com/bcgov/platform-services-registry/commit/bd691d686ff6a7b66ee977a0fabac57047b1a69a))
* **clean-codes:** add return-early-pattern ([e9c51be](https://github.com/bcgov/platform-services-registry/commit/e9c51be20377ed7dbfbf791bb095a7194a074fb2))
## [0.3.0](https://github.com/bcgov/platform-services-registry/compare/v0.2.0...v0.3.0) (2023-11-16)

### Features

* **1231:** add secure headers in nextjs config ([f31d90c](https://github.com/bcgov/platform-services-registry/commit/f31d90cd03727a4db3fc7ded44b0f74de8abcbb8))
* **897:** add rows per page selection on paginations ([89635bf](https://github.com/bcgov/platform-services-registry/commit/89635bfaa4581120756adef6c6b89ef0fc072997))
* add nounce to remove 'unsafe-inline' in csp ([46db8cf](https://github.com/bcgov/platform-services-registry/commit/46db8cf5f690a2533b75a7fae30fbc4cb70c0193))
* Added nats messeges ([#1250](https://github.com/bcgov/platform-services-registry/issues/1250)) ([f5abcc2](https://github.com/bcgov/platform-services-registry/commit/f5abcc2d02fbb6d69c64af8e16b6c457fa705cb9))
* send emails for create/approve/reject and more tests ([eac1dbf](https://github.com/bcgov/platform-services-registry/commit/eac1dbf4b28264dbee0bb8b8ba9bdfea15b71b10))

### Bug Fixes

* better type definitions for ches and emails ([79de07c](https://github.com/bcgov/platform-services-registry/commit/79de07cd21769b86bd8d1dbab3ac471e72554dfd))
* change data passed to sendNewRequestEmails to request ([14c027a](https://github.com/bcgov/platform-services-registry/commit/14c027ace7006964e28454283b8e305c240ba7be))
* deny request properly calls email function and pr fixes ([e12d5e4](https://github.com/bcgov/platform-services-registry/commit/e12d5e4e6f186adb546597dc0e8370e7914e2f15))
* organize auth options ([0233ee2](https://github.com/bcgov/platform-services-registry/commit/0233ee20d977eaab792a89b15c5760a86e3c3368))
* remove snapshot testing ([ed5e3a7](https://github.com/bcgov/platform-services-registry/commit/ed5e3a75f75680e303545ac0aba1bd3956e4c66c))
## [0.2.0](https://github.com/bcgov/platform-services-registry/compare/8c6642cd17de15ced6c2c2268b9e1c02e0034be2...v0.2.0) (2023-11-03)

### Features

* **1226:** add deployment pipelines in test & prod ([8eeda41](https://github.com/bcgov/platform-services-registry/commit/8eeda41c806d04f2e7702c446f0080ffe48e53a5))
* **1226:** add release & changelog configurations ([19a87b2](https://github.com/bcgov/platform-services-registry/commit/19a87b28d4134a62068b0b244f92e1dcf4ac691b))
* add deployment helm charts ([fc177c4](https://github.com/bcgov/platform-services-registry/commit/fc177c4252650aedc7b2ea0297b8f40b8e91fb3f))
* add development sandbox ([a69cb95](https://github.com/bcgov/platform-services-registry/commit/a69cb9586671e52e90a94879afd28e59ff80a55e))
* CHES endpoint and header template ([3e3393a](https://github.com/bcgov/platform-services-registry/commit/3e3393acacaf301509434f50fe3cc34e5a557e74))
* create oc service accounts ([940d948](https://github.com/bcgov/platform-services-registry/commit/940d9486e0b49b9c2517b3b4dc55246a9a0d332c))
* product details ([5ebad12](https://github.com/bcgov/platform-services-registry/commit/5ebad1215c7666151e0f7d600f3d91148e27385a))
* provide default userImage ([bc49ca2](https://github.com/bcgov/platform-services-registry/commit/bc49ca2d965668c33d6bce17d3d3e7c8d747347a))

### Bug Fixes

* **1235:** resolvenode-fetch Headers importing issue ([489a731](https://github.com/bcgov/platform-services-registry/commit/489a731c29a601678967ccd417926ae9c7014ec8))
* pagination number and avatar ([a00af1b](https://github.com/bcgov/platform-services-registry/commit/a00af1bb70db15c4b6c24b518131c198b30e0d7c))

### Docs

* add developer guide ([8c6642c](https://github.com/bcgov/platform-services-registry/commit/8c6642cd17de15ced6c2c2268b9e1c02e0034be2))
* remove duplicate example ([01b7e02](https://github.com/bcgov/platform-services-registry/commit/01b7e02f3dc0ea35381dcb5bae9f3eb086800f67))
* update developer-guide ([ca5e1fa](https://github.com/bcgov/platform-services-registry/commit/ca5e1fad9a0b271021aeab343f52d1dca5a24712))
* update team conventions ([60499b4](https://github.com/bcgov/platform-services-registry/commit/60499b429828500f65de6a5321f25a4af2bbb2a5))
* update team conventions ([9160ac4](https://github.com/bcgov/platform-services-registry/commit/9160ac40ab9e284c38470e213c924a25935df89d))

### Refactors

* **1235:** update useQuery syntax accordingly to the new version ([f7a48cd](https://github.com/bcgov/platform-services-registry/commit/f7a48cd7ce3e3c8ff10c92baf11f957aba3d9538))
