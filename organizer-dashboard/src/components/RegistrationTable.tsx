"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function RegistrationTable({
    initialData,
}: {
    initialData: any[];
}) {
    const [registrations, setRegistrations] = useState(initialData);

    useEffect(() => {
        // Connect directly to the Registration Service's public port
        const socket = io("http://localhost:8081");

        socket.on("registration-updated", (updatedReg) => {
            setRegistrations((prev) => {
                // Check if registration already exists (update it) or add new one
                const exists = prev.find((r) => r.id === updatedReg.id);
                if (exists) {
                    return prev.map((r) =>
                        r.id === updatedReg.id ? updatedReg : r,
                    );
                }
                return [updatedReg, ...prev];
            });
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">
                            Participant
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">
                            Role
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase">
                            Status
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {registrations.map((reg) => (
                        <tr
                            key={reg.id}
                            className="hover:bg-blue-50 transition-all duration-300"
                        >
                            <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">
                                    {reg.participant_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {reg.participant_email}
                                </div>
                            </td>
                            <td className="px-6 py-4 capitalize text-sm text-gray-700">
                                {reg.role}
                            </td>
                            <td className="px-6 py-4">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold animate-pulse ${
                                        reg.status === "confirmed"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-orange-100 text-orange-700"
                                    }`}
                                >
                                    {reg.status.toUpperCase()}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
