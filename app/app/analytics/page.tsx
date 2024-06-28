import { loginEvents } from '@/analytics/general/login';
import CombinedAreaGraph from '@/components/analytics/CombinedAreaGraph';
import createServerPage from '@/core/server-page';
import { PermissionsEnum } from '@/types/permissions';

const analyticsDashboard = createServerPage({
  permissions: [PermissionsEnum.ViewGeneralAnalytics],
});
export default analyticsDashboard(async () => {
  const loginEventData = await loginEvents();

  return (
    <div className="">
      <h1 className="text-xl lg:text-2xl 2xl:text-4xl font-semibold leading-7 text-gray-900">General Analytics</h1>
      <div className="flex flex-col gap-y-12 mt-14">
        <CombinedAreaGraph
          title="Daily User Login Events"
          subtitle="This chart displays the number of login events per day over the past 3 months."
          chartData={loginEventData}
          categories={['Logins']}
          colors={['indigo']}
          exportApiEndpoint="/analytics/csv/login"
        />
      </div>
    </div>
  );
});
