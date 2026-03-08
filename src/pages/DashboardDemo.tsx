import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import AnimatedSection from "@/components/AnimatedSection";

const nodes = [
  { id: "intern", label: "Intern", x: 80, y: 120, risk: "high" },
  { id: "admin", label: "Admin", x: 250, y: 60, risk: "medium" },
  { id: "vendor", label: "Vendor", x: 420, y: 130, risk: "high" },
  { id: "custdb", label: "Customer DB", x: 130, y: 280, risk: "high" },
  { id: "github", label: "GitHub Repo", x: 310, y: 220, risk: "medium" },
  { id: "payment", label: "Payment System", x: 450, y: 300, risk: "low" },
];

const edges = [
  ["intern", "custdb"], ["intern", "github"], ["admin", "custdb"], ["admin", "github"],
  ["admin", "payment"], ["vendor", "github"], ["vendor", "payment"], ["custdb", "payment"],
];

const riskColor = (r: string) => r === "high" ? "#EF4444" : r === "medium" ? "#F59E0B" : "#22C55E";

const scenarios = [
  { text: "Intern exported customer data to personal device", risk: "Critical" },
  { text: "Vendor API key reused in production", risk: "High" },
  { text: "Ex-employee access remained active for 90 days", risk: "High" },
  { text: "Admin overlap caused critical deletion", risk: "Critical" },
  { text: "Cloud storage bucket was publicly exposed", risk: "Medium" },
  { text: "Unreviewed code pushed directly to production", risk: "Medium" },
];

const heatmapData = [
  { label: "Customer DB", risk: 92, color: "#EF4444" },
  { label: "Payment System", risk: 45, color: "#F59E0B" },
  { label: "GitHub Repo", risk: 67, color: "#F59E0B" },
  { label: "Auth Service", risk: 23, color: "#22C55E" },
  { label: "Cloud Storage", risk: 78, color: "#EF4444" },
  { label: "API Gateway", risk: 34, color: "#22C55E" },
];

const DashboardDemo = () => {
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  return (
    <Layout>
      <section className="relative">
        <div className="section-padding">
          <AnimatedSection className="text-center mb-12">
            <p className="text-sm font-medium text-primary mb-2 tracking-widest uppercase">Live Demo</p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              Risk <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Interactive prototype showing how OrgSentinel visualizes internal risk.
            </p>
          </AnimatedSection>

          {/* Top row: Graph + Heatmap */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Access Graph */}
            <AnimatedSection>
              <div className="glass-card p-6 h-full">
                <h3 className="font-display font-semibold text-foreground mb-4 text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" /> Access Graph
                </h3>
                <div className="relative bg-muted/20 rounded-lg overflow-hidden" style={{ height: 360 }}>
                  <svg width="100%" height="100%" viewBox="0 0 530 370" className="p-4">
                    {edges.map(([from, to], i) => {
                      const a = nodeMap[from], b = nodeMap[to];
                      return (
                        <motion.line
                          key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                          stroke="hsl(217,91%,60%)" strokeWidth="1.5" strokeOpacity="0.3"
                          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                        />
                      );
                    })}
                    {nodes.map((node, i) => (
                      <motion.g key={node.id}
                        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        <circle cx={node.x} cy={node.y} r="28" fill="hsl(222,30%,14%)" stroke={riskColor(node.risk)} strokeWidth="2" />
                        <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle" fill="hsl(210,40%,93%)" fontSize="10" fontFamily="Inter">{node.label}</text>
                      </motion.g>
                    ))}
                  </svg>
                </div>
              </div>
            </AnimatedSection>

            {/* Risk Heatmap */}
            <AnimatedSection delay={0.1}>
              <div className="glass-card p-6 h-full">
                <h3 className="font-display font-semibold text-foreground mb-4 text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary" /> Risk Heatmap
                </h3>
                <div className="space-y-4">
                  {heatmapData.map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">{item.label}</span>
                        <span style={{ color: item.color }}>{item.risk}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-muted/30 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: item.color }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.risk}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Blast Radius Score */}
                <div className="mt-6 p-4 rounded-lg bg-muted/20 border border-border/50 text-center">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Blast Radius Score</p>
                  <motion.p
                    className="font-display text-4xl font-bold"
                    style={{ color: "#F59E0B" }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                  >
                    72 <span className="text-lg text-muted-foreground font-normal">/ 100</span>
                  </motion.p>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Bottom: Failure Scenarios */}
          <AnimatedSection delay={0.2}>
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold text-foreground mb-4 text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" /> Top Failure Scenarios
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {scenarios.map((s, i) => (
                  <motion.div
                    key={i}
                    className="p-4 rounded-lg bg-muted/20 border border-border/30 hover:border-primary/30 transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        s.risk === "Critical" ? "bg-destructive/20 text-destructive" :
                        s.risk === "High" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-blue-500/20 text-blue-400"
                      }`}>
                        {s.risk}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{s.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
};

export default DashboardDemo;
