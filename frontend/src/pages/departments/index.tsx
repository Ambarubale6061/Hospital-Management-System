import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useListDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from "@/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Building2, Pencil, Trash2, Loader2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export default function Departments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: departments, isLoading } = useListDepartments();
  const createDept = useCreateDepartment();
  const updateDept = useUpdateDepartment();
  const deleteDept = useDeleteDepartment();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  });

  const openCreate = () => {
    setEditingId(null);
    form.reset({ name: "", description: "" });
    setOpen(true);
  };

  const openEdit = (dept: { id: number; name: string; description?: string | null }) => {
    setEditingId(dept.id);
    form.reset({ name: dept.name, description: dept.description || "" });
    setOpen(true);
  };

  const onSubmit = (values: z.infer<typeof schema>) => {
    const payload = { name: values.name, description: values.description || null };
    if (editingId) {
      updateDept.mutate({ id: editingId, data: payload }, {
        onSuccess: () => { toast({ title: "Department updated" }); setOpen(false); },
        onError: (err) => toast({ title: "Update failed", description: err.message, variant: "destructive" }),
      });
    } else {
      createDept.mutate({ data: payload }, {
        onSuccess: () => { toast({ title: "Department created" }); setOpen(false); },
        onError: (err) => toast({ title: "Create failed", description: err.message, variant: "destructive" }),
      });
    }
  };

  const onDelete = (id: number) => {
    deleteDept.mutate({ id }, {
      onSuccess: () => toast({ title: "Department removed" }),
      onError: (err) => toast({ title: "Delete failed", description: err.message, variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground mt-1">Manage hospital departments</p>
        </div>
        {user?.role === "admin" && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" /> Add Department
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Department" : "Add Department"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Cardiology" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={createDept.isPending || updateDept.isPending}>
                    {(createDept.isPending || updateDept.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingId ? "Save Changes" : "Create Department"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  {user?.role === "admin" && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={3}><div className="h-8 bg-muted rounded animate-pulse" /></TableCell></TableRow>
                  ))
                ) : departments && departments.length > 0 ? (
                  departments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell className="text-muted-foreground">{dept.description || "—"}</TableCell>
                      {user?.role === "admin" && (
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(dept)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete department?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove "{dept.name}". This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(dept.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-12">
                      <Building2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">No departments found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
