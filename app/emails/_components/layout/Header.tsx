import { Img, Text } from '@react-email/components';
import { BASE_URL } from '@/config';

export default function Header() {
  return (
    <div className="flex flex-row border-solid border-0 border-b-3 border-bcorange bg-bcblue shadow">
      <Img
        src={`${BASE_URL}/logo.png`}
        alt="BC Platform Services Product Registry"
        width={58}
        height={41}
        className="m-auto ml-4 mr-4"
      />
      <div className="flex flex-row text-white">
        <Text className="text-lg mr-2 font-roboto font-thin">BC Platform Services</Text>
        <Text className="text-lg font-roboto font-normal">Product Registry</Text>
      </div>
    </div>
  );
}
