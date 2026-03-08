import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, Plus, Trash2, Play, FileSpreadsheet, PenTool } from "lucide-react";
import Papa from "papaparse";
import Layout from "@/components/Layout";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSimulation, AccessEntry } from "@/context/SimulationContext";
import { runSimulation } from "@/lib/simulationEngine";
import { useToast } from "@/hooks/use-toast";

const DEMO_ROLES = ["Intern", "Admin", "Vendor", "Employee"];
const DEMO_RESOURCES = ["Customer Database", "GitHub Repo", "Payment System", "Cloud Storage", "Auth Service"];
const PERMISSIONS = ["read", "write", "admin"];

const DEMO_ENTRIES: AccessEntry[] = [
  { userId: "u1", role: "Intern", resource: "Customer Database", permission: "read" },
  { userId: "u2", role: "Admin", resource: "Payment System", permission: "admin" },
  { userId: "u3", role: "Vendor", resource: "GitHub Repo", permission: "write" },
  { userId: "u4", role: "Employee", resource: "Cloud Storage", permission: "read" },
  { userId: "u2", role: "Admin", resource: "Customer Database", permission: "admin" },
  { userId: "u3", role: "Vendor", resource: "Payment System", permission: "read" },
  { userId: "u1", role: "Intern", resource: "GitHub Repo", permission: "read" },
];

const Simulate = () => {
  const [mode, setMode] = useState<"csv" | "manual">("manual");
  const [entries, setEntries] = useState<AccessEntry[]>([]);
  const [newEntry, setNewEntry] = useState<AccessEntry>({ userId: "", role: DEMO_ROLES[0], resource: DEMO_RESOURCES[0], permission: PERMISSIONS[0] });
  const [running, setRunning] = useState(false);
  const { setResult } = useSimulation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCSV = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed: AccessEntry[] = results.data
          .filter(r => r.user_id && r.role && r.resource && r.permission)
          .map(r => ({ userId: r.user_id, role: r.role, resource: r.resource, permission: r.permission }));
        if (parsed.length === 0) {
          toast({ title: "Invalid CSV", description: "Ensure columns: user_id, role, resource, permission", variant: "destructive" });
          return;
        }
        setEntries(parsed);
        toast({ title: "CSV Loaded", description: `${parsed.length} access entries parsed.` });
      },
    });
  }, [toast]);

  const addEntry = () => {
    if (!newEntry.userId.trim()) {
      toast({ title: "User ID required", variant: "destructive" });
      return;
    }
    setEntries(prev => [...prev, { ...newEntry, userId: newEntry.userId.trim() }]);
    setNewEntry(prev => ({ ...prev, userId: "" }));
  };

  const removeEntry = (i: number) => setEntries(prev => prev.filter((_, idx) => idx !== i));

  const loadDemo = () => {
    setEntries(DEMO_ENTRIES);
    toast({ title: "Demo data loaded", description: "7 sample access entries added." });
  };

  const runSim = async () => {
    if (entries.length === 0) {
      toast({ title: "No data", description: "Add access entries or upload a CSV first.", variant: "destructive" });
      return;
    }
    setRunning(true);
    // Artificial delay for UX
    await new Promise(r => setTimeout(r, 1500));
    const result = runSimulation(entries);
    setResult(result);
    setRunning(false);
    navigate("/dashboard-demo");
  };

  return (
    <Layout>
      <section className="relative min-h-screen">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-electric-blue/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-electric-purple/5 rounded-full blur-[120px]" />

        <div className="section-padding relative z-10">
          <AnimatedSection className="text-center mb-12">
            <p className="text-sm font-medium text-primary mb-2 tracking-widest uppercase">Simulation Engine</p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              Configure Your <span className="gradient-text">Simulation</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Upload organization access data or build it manually, then run the risk simulation engine.
            </p>
          </AnimatedSection>

          {/* Mode Toggle */}
          <div className="flex justify-center gap-3 mb-8">
            <Button
              variant={mode === "csv" ? "default" : "outline"}
              onClick={() => setMode("csv")}
              className="gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" /> Upload CSV
            </Button>
            <Button
              variant={mode === "manual" ? "default" : "outline"}
              onClick={() => setMode("manual")}
              className="gap-2"
            >
              <PenTool className="w-4 h-4" /> Manual Config
            </Button>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* CSV Upload */}
            {mode === "csv" && (
              <AnimatedSection>
                <div className="glass-card p-8 text-center">
                  <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-display font-semibold text-foreground mb-2">Upload CSV File</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Format: <code className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">user_id,role,resource,permission</code>
                  </p>
                  <label className="btn-primary inline-flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4" /> Choose File
                    <input type="file" accept=".csv" onChange={handleCSV} className="hidden" />
                  </label>
                </div>
              </AnimatedSection>
            )}

            {/* Manual Config */}
            {mode === "manual" && (
              <AnimatedSection>
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-semibold text-foreground text-sm">Add Access Relationship</h3>
                    <Button variant="outline" size="sm" onClick={loadDemo} className="text-xs">
                      Load Demo Data
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                    <Input
                      placeholder="User ID (e.g. u1)"
                      value={newEntry.userId}
                      onChange={e => setNewEntry(prev => ({ ...prev, userId: e.target.value }))}
                      className="bg-muted/30 border-border/50"
                    />
                    <Select value={newEntry.role} onValueChange={v => setNewEntry(prev => ({ ...prev, role: v }))}>
                      <SelectTrigger className="bg-muted/30 border-border/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DEMO_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={newEntry.resource} onValueChange={v => setNewEntry(prev => ({ ...prev, resource: v }))}>
                      <SelectTrigger className="bg-muted/30 border-border/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DEMO_RESOURCES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={newEntry.permission} onValueChange={v => setNewEntry(prev => ({ ...prev, permission: v }))}>
                      <SelectTrigger className="bg-muted/30 border-border/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PERMISSIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button onClick={addEntry} className="gap-1">
                      <Plus className="w-4 h-4" /> Add
                    </Button>
                  </div>
                </div>
              </AnimatedSection>
            )}

            {/* Entries Table */}
            {entries.length > 0 && (
              <AnimatedSection delay={0.1}>
                <div className="glass-card p-6 mt-6">
                  <h3 className="font-display font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" /> Access Entries ({entries.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/30">
                          <th className="text-left py-2 text-muted-foreground font-medium">User ID</th>
                          <th className="text-left py-2 text-muted-foreground font-medium">Role</th>
                          <th className="text-left py-2 text-muted-foreground font-medium">Resource</th>
                          <th className="text-left py-2 text-muted-foreground font-medium">Permission</th>
                          <th className="w-10" />
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map((e, i) => (
                          <motion.tr
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="border-b border-border/10 hover:bg-muted/10"
                          >
                            <td className="py-2 text-foreground">{e.userId}</td>
                            <td className="py-2">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{e.role}</span>
                            </td>
                            <td className="py-2 text-foreground">{e.resource}</td>
                            <td className="py-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                e.permission === "admin" ? "bg-destructive/20 text-destructive" :
                                e.permission === "write" ? "bg-yellow-500/20 text-yellow-400" :
                                "bg-green-500/20 text-green-400"
                              }`}>{e.permission}</span>
                            </td>
                            <td>
                              <button onClick={() => removeEntry(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </AnimatedSection>
            )}

            {/* Run Button */}
            <AnimatedSection delay={0.2}>
              <div className="mt-8 text-center">
                <Button
                  onClick={runSim}
                  disabled={running || entries.length === 0}
                  size="lg"
                  className="btn-primary text-base gap-2 min-w-[220px]"
                >
                  {running ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
                      Running Simulation...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" /> Run Simulation
                    </>
                  )}
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Simulate;
