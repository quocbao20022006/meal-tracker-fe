import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle,
  EditIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CreateMealPlanRequest,
  MealPlanResponse,
  PlanType,
  UpdateMealPlanRequest,
} from "../types";
import * as mealPlanService from "../services/meal-plan.service";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatDate } from "@/utils";
import { MEAL_PLAN_ALREADY_HAD_MEAL_PLAN_ITEM } from "@/utils/messages";
import ConfirmDialog from "@/components/ConfirmPopup";

export default function Plans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<MealPlanResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MealPlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const { user } = useAuthContext();

  const [formData, setFormData] = useState<CreateMealPlanRequest>({
    name: "",
    startDate: "",
    endDate: "",
    isActive: true,
    planType: PlanType.WEEKLY,
    userId: user?.id!,
    note: "",
    targetCalories: 0,
  });

  useEffect(() => {
    if (user?.id) {
      loadPlans();
    }
  }, [user?.id]);

  const loadPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await mealPlanService.getAllMealPlans({
        userId: user?.id,
      });

      if (result.error) {
        setError(result.error.message || "Failed to fetch meals");
        return;
      }

      const data = result.data?.content || [];
      setPlans(data);
    } catch (err) {
      console.error("Error loading plans:", err);
      setError("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Plan name is required");
      return;
    }

    if (!formData.startDate) {
      setError("Start date is required");
      return;
    }

    if (!formData.endDate) {
      setError("End date is required");
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError("Start date must be before end date");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const body: CreateMealPlanRequest = {
        userId: user?.id!,
        name: formData.name,
        endDate: formatDate(formData.endDate),
        startDate: formatDate(formData.startDate),
        isActive: false,
        targetCalories: formData.targetCalories,
        note: formData.note,
        planType: formData.planType,
      };
      const result = await mealPlanService.createMealPlan(body);
      if (result.data) {
        setFormData(body);
        setOpen(false);
        await loadPlans();
      }
    } catch (err) {
      console.error("Error creating plan:", err);
      setError("Failed to create plan");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    if (!formData.name.trim()) {
      setError("Plan name is required");
      return;
    }

    if (!formData.startDate) {
      setError("Start date is required");
      return;
    }

    if (!formData.endDate) {
      setError("End date is required");
      return;
    }

    if (
      (formData.startDate !== editingPlan.startDate ||
        formData.endDate !== editingPlan.endDate) &&
      new Date(formData.startDate) > new Date(formData.endDate)
    ) {
      setError("Start date must be before end date");
      return;
    }

    if (
      formData.startDate !== editingPlan.startDate &&
      new Date(formData.startDate) < new Date()
    ) {
      setError("Start date must be current date or later");
      return;
    }

    if (
      formData.isActive !== editingPlan?.isActive &&
      new Date(formData.endDate) < new Date()
    ) {
      setError("This meal plan is expired. Cannot update meal plan status.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const body: UpdateMealPlanRequest = {
        name: formData.name,
        endDate: formatDate(formData.endDate),
        startDate: formatDate(formData.startDate),
        isActive: formData.isActive || false,
        targetCalories: formData.targetCalories,
        note: formData.note,
        planType: editingPlan.planType,
      };
      const result = await mealPlanService.updateMealPlan(
        editingPlan?.id,
        body
      );
      if (result.error) {
        throw error;
      }

      setOpenEdit(false);
      setEditingPlan(null);
      await loadPlans();
    } catch (err) {
      console.error("Error updating plan:", err);
      setError("Failed to update plan");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (id: number) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;

    try {
      const res = await mealPlanService.deleteMealPlan(id);
      if (res.error) {
        alert(
          res.error?.data === MEAL_PLAN_ALREADY_HAD_MEAL_PLAN_ITEM
            ? "Cannot delete the meal plan having meal items."
            : res.error?.data
        );
        return;
      }
      await loadPlans();
    } catch (err: any) {
      console.log(err);
      console.error("Error deleting plan:", err);
      setError("Failed to delete plan");
    }
  };

  const handleToggleUpdate = async (plan: MealPlanResponse) => {
    setFormData(() => plan);
    setEditingPlan(() => plan);
    setOpenEdit(true);
  };

  const getDaysUntilEnd = (endDate: string): number => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (plan: MealPlanResponse) => {
    if (!plan.isActive) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          Inactive
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-200">
        Active
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Meal Plans" />

      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Header with Create Button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Meal Plans
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Create and manage your meal planning schedules
              </p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all">
                  <Plus className="w-4 h-4" />
                  New Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Plan</DialogTitle>
                  <DialogDescription>
                    Set up a new meal planning period
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreatePlan} className="space-y-4">
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <p className="text-red-800 dark:text-red-200 text-sm">
                        {error}
                      </p>
                    </div>
                  )}
                  {/* Plan Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Plan Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Summer Diet Plan"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.note || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          note: e.target.value,
                        })
                      }
                      placeholder="Add notes about your plan..."
                      rows={2}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  {/* Goal */}
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Goal
                    </label>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={formData.targetCalories || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          targetCalories: +e.target.value,
                        })
                      }
                      placeholder="e.g., Lose weight, Build muscle, Maintain health"
                    />
                  </div> */}

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Start Date *
                    </label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      End Date *
                    </label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                    />
                  </div>

                  {/* Active Toggle */}
                  {/* <div className="flex items-center space-x-2 p-3 bg-secondary rounded-lg">
                    <Checkbox
                      id="isActive"
                      checked={formData.isActive ?? true}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          isActive: checked as boolean,
                        })
                      }
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                    >
                      Activate this plan immediately
                    </label>
                  </div> */}

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setOpen(false);
                        setError(null);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? "Creating..." : "Create Plan"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Plans Grid */}
          {loading && !plans.length ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No meal plans yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Create your first meal plan to get started
              </p>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 mx-auto">
                    <Plus className="w-4 h-4" />
                    Create Plan
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className="flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle
                          className="text-xl"
                          onClick={() => navigate(`/plans/${plan.id}`)}
                        >
                          {plan.name}
                        </CardTitle>
                        {plan.note && (
                          <CardDescription className="line-clamp-2 mt-1">
                            {plan.note}
                          </CardDescription>
                        )}
                        {plan.targetCalories && (
                          <div className="text-sm text-primary font-medium mt-2">
                            🎯 {plan.targetCalories}
                          </div>
                        )}
                      </div>
                      {getStatusBadge(plan)}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4">
                    {/* Dates */}
                    <div className="space-y-2 p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {new Date(plan.startDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {new Date(plan.endDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <span className="text-xs font-semibold text-muted-foreground">
                          {Math.max(0, getDaysUntilEnd(plan.endDate))} days
                          remaining
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleToggleUpdate(plan)}
                        variant={"default"}
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all"
                      >
                        <EditIcon className="w-4 h-4 mr-2" />
                        {"Update"}
                      </Button>
                      <Button
                        onClick={() => handleDeletePlan(plan.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Meal Plan</DialogTitle>
            <DialogDescription>
              Update an existing meal planning period
            </DialogDescription>
          </DialogHeader>
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleUpdatePlan} className="space-y-4">
            {/* Plan Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Plan Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Summer Diet Plan"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Description
              </label>
              <textarea
                value={formData.note || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    note: e.target.value,
                  })
                }
                placeholder="Add notes about your plan..."
                rows={2}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Goal */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Goal
              </label>
              <Input
                type="number"
                min={0}
                step={1}
                value={formData.targetCalories || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetCalories: +e.target.value,
                  })
                }
                placeholder="e.g., Lose weight, Build muscle, Maintain health"
              />
            </div> */}

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Start Date *
              </label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                End Date *
              </label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center space-x-2 p-3 bg-secondary rounded-lg">
              <Checkbox
                id="isActive"
                checked={formData.isActive ?? true}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setShowConfirm(true);
                  } else {
                    setFormData({ ...formData, isActive: false });
                  }
                }}
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
              >
                Activate this plan immediately
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpenEdit(false);
                  setError(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Updating..." : "Update Plan"}
              </Button>
            </div>
          </form>
          <ConfirmDialog
            open={showConfirm}
            title="Activate meal plan?"
            message="Another meal plan is already active. Activating this plan will deactivate the current one. Continue?"
            onCancel={() => setShowConfirm(false)}
            onConfirm={() => {
              setFormData({ ...formData, isActive: true });
              setShowConfirm(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
