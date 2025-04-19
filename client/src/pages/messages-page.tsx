
import { useState } from "react";
import DashboardLayout from "@/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Message } from "@shared/schema";

const columns = [
  {
    accessorKey: "content",
    header: "Message",
  },
  {
    accessorKey: "message_type",
    header: "Type",
  },
  {
    accessorKey: "receiver_role",
    header: "Receiver",
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleDateString(),
  },
];

export default function MessagesPage() {
  const [search, setSearch] = useState("");

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: async () => {
      const res = await fetch("/api/schools/1/messages");
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
  });

  const filteredMessages = messages.filter((message) =>
    message.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Messages">
      <div className="p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Messages</CardTitle>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Search messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {isLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <DataTable columns={columns} data={filteredMessages} />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
