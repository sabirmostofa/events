import RegistrationTable from "@/components/RegistrationTable";
import { getRegistrations } from "@/lib/api";

export default async function DashboardPage() {
    // 1. Fetch data on the server first
    const data = await getRegistrations();

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900">
                            Live Dashboard
                        </h1>
                        <p className="text-gray-500">
                            Real-time registration tracking for your Tango
                            Festival.
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-medium text-green-600">
                            Live Connection Active
                        </span>
                    </div>
                </div>

                {/* 2. Pass the initial server data to the client component */}
                <RegistrationTable initialData={data} />
            </div>
        </div>
    );
}
