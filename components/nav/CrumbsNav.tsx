import Crumbs from "@/components/nav/Crumbs";

export default function CrumbsNav() {
  return (
    <div className="sm:px-6 lg:px-8">
      <div className="flex h-16 justify-left items-center">
        <div className="font-bcsans text-2xl text-cloudgrey ">
          PRIVATE CLOUD
        </div>
        <div className="border-l h-12 border-divider mx-5"></div> {/* Adjust the height (h-20) and color (border-gray-500) as needed */}
        <Crumbs backUrl={"#"} currentLabel={"Test Project"} previousLabel="Request"/>
      </div>
    </div>
  );
}
