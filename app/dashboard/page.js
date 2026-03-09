"use client";

import React, { Suspense, useContext, useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UserContext } from "@/context/UserContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PricingModal } from "@/components/Home/PricingModal";
import Lookup from "@/data/Lookup";
import { toast } from "sonner";
import { Plus, FolderOpen, Zap, Loader2Icon, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Gradient palette for workspace card thumbnails (cycles by index)
const GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-pink-600",
  "from-green-500 to-teal-600",
  "from-orange-500 to-red-600",
  "from-cyan-500 to-blue-600",
  "from-rose-500 to-pink-600",
];

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function DashboardContent() {
  const { user } = useContext(UserContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPricing, setShowPricing] = useState(false);

  const [renameData, setRenameData] = useState({ isOpen: false, id: null, title: "" });
  const [deleteData, setDeleteData] = useState({ isOpen: false, id: null });
  const [renameInput, setRenameInput] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Show a success toast when returning from Stripe checkout
  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      toast.success("You're now on Pro! Enjoy unlimited prompts.");
      // Remove the query param without a page reload
      router.replace("/dashboard");
    }
  }, [searchParams, router]);

  // Redirect unauthenticated users to home
  useEffect(() => {
    if (typeof window !== "undefined" && !user) {
      router.push("/");
    }
  }, [user, router]);

  const userData = useQuery(
    api.user.getUserById,
    user?.id ? { userId: user.id } : "skip"
  );

  const workspaces = useQuery(
    api.workspace.GetWorkspacesByUser,
    user?.id ? { userId: user.id } : "skip"
  );

  const updateWorkspace = useMutation(api.workspace.UpdateWorkspace);
  const deleteWorkspace = useMutation(api.workspace.DeleteWorkspace);

  const handleRenameClick = (e, id, currentTitle) => {
    e.preventDefault();
    e.stopPropagation();
    setRenameData({ isOpen: true, id, title: currentTitle });
    setRenameInput(currentTitle);
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!renameInput.trim() || renameInput.trim() === renameData.title) {
      setRenameData({ isOpen: false, id: null, title: "" });
      return;
    }
    setIsRenaming(true);
    try {
      await updateWorkspace({ id: renameData.id, title: renameInput.trim() });
      toast.success("Project renamed successfully.");
    } catch (error) {
      toast.error("Failed to rename project.");
    } finally {
      setIsRenaming(false);
      setRenameData({ isOpen: false, id: null, title: "" });
    }
  };

  const handleDeleteClick = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteData({ isOpen: true, id });
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteWorkspace({ id: deleteData.id });
      toast.success("Project deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete project.");
    } finally {
      setIsDeleting(false);
      setDeleteData({ isOpen: false, id: null });
    }
  };

  const plan = userData?.plan ?? "free";
  const planLimits = Lookup.PLANS[plan];
  const promptsUsed = userData?.promptsUsed ?? 0;
  const usagePercent = Math.min(100, (promptsUsed / planLimits.promptLimit) * 100);

  const isLoading = workspaces === undefined;

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Projects</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {workspaces?.length ?? 0} workspace
              {workspaces?.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Usage + plan card */}
        {userData && (
          <div className="mb-8 rounded-xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    plan === "pro"
                      ? "border-blue-400 text-blue-500 bg-blue-50 dark:bg-blue-950/40"
                      : "border-gray-300 text-gray-500"
                  }`}
                >
                  {plan === "pro" ? "Pro ✦" : "Free"}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {promptsUsed} / {planLimits.promptLimit} prompts used this month
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    usagePercent >= 90
                      ? "bg-red-500"
                      : usagePercent >= 70
                      ? "bg-yellow-500"
                      : "bg-blue-500"
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>

            {plan === "free" ? (
              <Button
                size="sm"
                className="gap-2 shrink-0"
                onClick={() => setShowPricing(true)}
              >
                <Zap className="w-3.5 h-3.5" />
                Upgrade to Pro
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => setShowPricing(true)}
              >
                Manage Plan
              </Button>
            )}
          </div>
        )}

        {/* Workspace grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2Icon className="animate-spin w-8 h-8 text-gray-400" />
          </div>
        ) : workspaces?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
            <FolderOpen className="w-12 h-12" />
            <p className="text-lg font-medium">No projects yet</p>
            <p className="text-sm">Head to the home page and enter a prompt to get started.</p>
            <Link href="/">
              <Button variant="outline" className="mt-2 gap-2">
                <Plus className="w-4 h-4" />
                Create your first project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {workspaces.map((ws, i) => {
              const firstMessage = ws.messages?.[0]?.content ?? "Untitled project";
              const title = ws.title ?? firstMessage.slice(0, 40);
              const gradient = GRADIENTS[i % GRADIENTS.length];

              return (
                <div key={ws._id} className="relative group">
                  <Link href={`/workspace/${ws._id}`}>
                    <div className="group-hover:shadow-md rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-shadow cursor-pointer">
                      {/* Color thumbnail */}
                      <div
                        className={`h-28 bg-gradient-to-br ${gradient} flex items-center justify-center`}
                      >
                        <span className="text-white text-3xl font-bold opacity-40 select-none">
                          {title.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Card body */}
                      <div className="p-4 relative">
                        <h3 className="font-semibold text-sm truncate group-hover:text-blue-500 transition-colors pr-6">
                          {title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {firstMessage.slice(0, 60)}
                          {firstMessage.length > 60 ? "…" : ""}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(ws._creationTime)}
                        </p>
                      </div>
                    </div>
                  </Link>
                  
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full bg-black/10 hover:bg-black/20 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => handleRenameClick(e, ws._id, title)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => handleDeleteClick(e, ws._id)}
                          className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameData.isOpen} onOpenChange={(open) => !isRenaming && setRenameData((prev) => ({ ...prev, isOpen: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            <DialogDescription>
              Enter a new name for your project.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRenameSubmit}>
            <div className="py-4">
              <Input
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                placeholder="Project Name"
                disabled={isRenaming}
                autoFocus
                className="w-full"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRenameData({ isOpen: false, id: null, title: "" })}
                disabled={isRenaming}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isRenaming}>
                {isRenaming && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteData.isOpen} onOpenChange={(open) => !isDeleting && setDeleteData((prev) => ({ ...prev, isOpen: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteData({ isOpen: false, id: null })}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PricingModal
        open={showPricing}
        onOpenChange={setShowPricing}
        currentPlan={plan}
        stripeCustomerId={userData?.stripeCustomerId}
      />
    </>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24"><Loader2Icon className="animate-spin w-8 h-8 text-gray-400" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
