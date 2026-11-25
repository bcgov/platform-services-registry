import { FABRIC_AI_USAGE_CODE_QUALITY_REPORT_ID, FABRIC_AI_USAGE_TEAM_REPORT_ID } from '@/config';
import { validateFabricReportAccess } from '@/services/fabric';

export async function validateFabricServicePrincipalReportAccess() {
  return validateFabricReportAccess([FABRIC_AI_USAGE_TEAM_REPORT_ID, FABRIC_AI_USAGE_CODE_QUALITY_REPORT_ID]);
}
