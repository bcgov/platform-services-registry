import { Img, Text } from '@react-email/components';

export default function Header() {
  return (
    <div className="flex flex-row border-b-3 border-bcorange bg-bcblue shadow">
      {/* <Img src="/static/logo.png" alt="BC Platform Services Product Registry" width={58} height={41} className="m-auto ml-2 mr-2" /> */}
      <Img
        src="https://dev-pltsvc.apps.silver.devops.gov.bc.ca/private-cloud/products/logo.png"
        alt="BC Platform Services Product Registry"
        width={58}
        height={41}
        className="m-auto ml-2 mr-2"
      />
      <div className="flex flex-row text-white">
        <Text className="text-lg mr-2 font-roboto font-thin">BC Platform Services</Text>
        <Text className="text-lg font-roboto font-normal">Product Registry</Text>
      </div>
    </div>
  );
}
