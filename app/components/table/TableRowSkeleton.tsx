export default function TableRowSkeleton() {
  return (
    <div role="status" className="p-6 rounded shadow animate-pulse dark:divide-gray-700 dark:border-gray-700">
      <div className="flex items-center justify-start space-x-16">
        <div className="h-4 bg-gray-100 rounded-full dark:bg-gray-300 w-48"></div>
        <div className="h-4 bg-gray-100 rounded-full dark:bg-gray-300 w-72"></div>
        <div className="h-4 bg-gray-100 rounded-full dark:bg-gray-300 w-24"></div>
        <div className="h-4 bg-gray-100 rounded-full dark:bg-gray-300 w-24"></div>
        <div className="h-4 bg-gray-100 rounded-full dark:bg-gray-300 w-24"></div>
        <div className="h-4 bg-gray-100 rounded-full dark:bg-gray-300 w-48"></div>
        <div className="h-4 bg-gray-100 rounded-full dark:bg-gray-300 w-24"></div>
      </div>
    </div>
  );
}
