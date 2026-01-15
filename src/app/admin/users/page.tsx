"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Users,
  Search,
  Shield,
  ShieldOff,
  Trash2,
  Mail,
  ShoppingCart,
  Smartphone,
  DollarSign,
  Loader2,
  MoreVertical,
  User,
} from "lucide-react";
import { useState } from "react";

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminUsersPage() {
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<Id<"users"> | null>(null);

  const users = useQuery(
    api.admin.getAllUsers,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const updateRole = useMutation(api.admin.updateUserRole);
  const deleteUser = useMutation(api.admin.deleteUser);

  const handleToggleAdmin = async (userId: Id<"users">, currentRole: string | undefined) => {
    if (!user?.id) return;
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (newRole === "user" && !confirm("Are you sure you want to remove admin privileges?")) return;
    if (newRole === "admin" && !confirm("Are you sure you want to grant admin privileges?")) return;

    await updateRole({ clerkId: user.id, userId, role: newRole });
  };

  const handleDelete = async (userId: Id<"users">) => {
    if (!user?.id) return;
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;

    try {
      await deleteUser({ clerkId: user.id, userId });
    } catch (error: any) {
      alert(error.message || "Failed to delete user");
    }
  };

  const filteredUsers = users?.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (!users) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--simlak-orange)]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Users</h1>
          <p className="text-muted-foreground">{users.length} total users</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-card rounded-2xl border border-border p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-muted rounded-xl border-0 focus:ring-2 focus:ring-[var(--simlak-orange)] outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Role</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Orders</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">eSIMs</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total Spent</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Joined</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers?.map((u) => (
                <tr key={u._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {u.imageUrl ? (
                        <img src={u.imageUrl} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[var(--simlak-orange)]/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-[var(--simlak-orange)]" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{u.name || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {u.role === "admin" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-[var(--simlak-orange)]/10 text-[var(--simlak-orange)]">
                        <Shield className="w-3 h-3" />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        <User className="w-3 h-3" />
                        User
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                      <span>{u.orderCount}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-muted-foreground" />
                      <span>{u.esimCount}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-[var(--simlak-teal)]">
                      {formatPrice(u.totalSpent)}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleAdmin(u._id, u.role)}
                        className={`p-2 rounded-lg transition-colors ${
                          u.role === "admin"
                            ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                            : "bg-muted hover:bg-muted/70 text-muted-foreground"
                        }`}
                        title={u.role === "admin" ? "Remove admin" : "Make admin"}
                      >
                        {u.role === "admin" ? (
                          <ShieldOff className="w-4 h-4" />
                        ) : (
                          <Shield className="w-4 h-4" />
                        )}
                      </button>
                      {u.orderCount === 0 && (
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
