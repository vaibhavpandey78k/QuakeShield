import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { analyzeWithPhi } from "./phi";


function App() {
  const [incidentText, setIncidentText] = useState("");
const [analysis, setAnalysis] = useState(null);
const [verification, setVerification] = useState(null);
const [deployment, setDeployment] = useState(null);
const [prediction, setPrediction] = useState(null);
const [agentLog, setAgentLog] = useState([]);
const [resources, setResources] = useState({
  ambulances: 3,
  rescueTeams: 2,
  helicopters: 1,
});

const [simulationActive, setSimulationActive] = useState(false);

const [incidentFeed, setIncidentFeed] = useState([
  "🔴 School collapse – Kathmandu",
  "🟠 Hospital overcrowding – Manila",
  "🟡 Road blockage – Bhaktapur",
]);

const [briefing, setBriefing] = useState(
  "Eastern sector currently has 4 critical incidents affecting approximately 62 civilians."
);
const simulateEarthquake = () => {
  setSimulationActive(true);

  setIncidentFeed([
    "🔴 Apartment collapse – Kathmandu",
    "🔴 School collapse – Lalitpur",
    "🟠 Hospital surge – Bhaktapur",
    "🟡 Highway blockage – Pokhara",
  ]);

  setBriefing(
    "Magnitude 7.2 earthquake simulated. Four critical incidents identified affecting approximately 180 civilians. Emergency assets nearing exhaustion."
  );

  setResources({
    ambulances: 1,
    rescueTeams: 0,
    helicopters: 0,
  });

  setAgentLog([
    "🧠 Intake Agent: Multiple incidents detected following Magnitude 7.2 earthquake.",
    "🔍 Verification Agent: 4 incidents verified with high confidence.",
    "🚑 Resource Agent: Emergency assets distributed across sectors.",
    "🔮 Prediction Agent: Hospital overload expected within 2 hours.",
  ]);
};
const analyzeIncident = async () => {
  const text = incidentText.toLowerCase();

  try {
  const phiResult = await analyzeWithPhi(incidentText);

  const parsed = JSON.parse(phiResult);

  setAnalysis({
    category: parsed.category,
    priority: parsed.priority,
    victims: parsed.victims,
    action: parsed.action,
  });

  setVerification({
    newsMatch: true,
    volunteerReports: true,
    nearbyIncidents: true,
    score: Number(parsed.confidence),
    status:
      Number(parsed.confidence) >= 90
        ? "VERIFIED"
        : Number(parsed.confidence) >= 60
        ? "LIKELY"
        : "UNVERIFIED",
  });
let deploymentResources = [];
let reason = "";

if (parsed.priority === "Critical") {
  deploymentResources = [
  "🚑 2 Ambulances",
  "👨‍🚒 1 Urban Search & Rescue Team",
  "🚁 1 Helicopter",
];

  reason =
    "LLM assessed this as a critical structural emergency.";
} else if (parsed.priority === "High") {
  resources = [
    "🚑 1 Ambulance",
    "👩‍⚕️ Medical Support Unit",
  ];

  reason =
    "LLM recommended urgent medical deployment.";
} else {
  resources = [
    "🚧 Road Clearance Team",
  ];

  reason =
    "LLM assessed moderate infrastructure impact.";
}

setDeployment({
  resources: deploymentResources,
  reason,
});
setResources((prev) => {
  let updated = { ...prev };

  if (parsed.priority === "Critical") {
    updated.ambulances = Math.max(0, prev.ambulances - 2);
    updated.rescueTeams = Math.max(0, prev.rescueTeams - 1);
    updated.helicopters = Math.max(0, prev.helicopters - 1);
  } else if (parsed.priority === "High") {
    updated.ambulances = Math.max(0, prev.ambulances - 1);
  }

  return updated;
});

let insights = [];

if (parsed.priority === "Critical") {
  insights = [
    "🏥 Hospital overload risk detected.",
    "🚑 Additional rescue teams should be mobilized.",
    "🚁 Air evacuation may become necessary.",
  ];
} else if (parsed.priority === "High") {
  insights = [
    "👩‍⚕️ Medical demand likely to increase.",
    "🚑 Monitor ambulance availability.",
    "📦 Prepare emergency supplies.",
  ];
} else {
  insights = [
    "🚧 Continue monitoring infrastructure.",
    "📡 Gather additional reports.",
    "👀 Situation remains under observation.",
  ];
}

setPrediction({
  insights,
});
 const logs = [];

logs.push(
  `🧠 Intake Agent: Incident classified as ${parsed.category}.`
);

logs.push(
  `🔍 Verification Agent: Confidence assessed at ${parsed.confidence}%. Incident ${
    Number(parsed.confidence) >= 90
      ? "verified"
      : Number(parsed.confidence) >= 60
      ? "likely credible"
      : "requires further investigation"
  }.`
);

logs.push(
  `🚑 Resource Agent: ${parsed.action}.`
);

if (insights.length > 0) {
  logs.push(
    `🔮 Prediction Agent: ${insights[0]}`
  );
}

setAgentLog(logs);

  return;
} catch (error) {
  console.log("Phi unavailable. Falling back.");
}

  let category = "General Emergency";
  let priority = "Medium";
  let action = "Monitor situation";

  if (text.includes("collapse")) {
    category = "Building Collapse";
    priority = "Critical";
    action = "Dispatch Urban Search & Rescue Team";
  } else if (text.includes("hospital")) {
    category = "Medical Emergency";
    priority = "High";
    action = "Deploy Medical Support Units";
  } else if (text.includes("road")) {
    category = "Infrastructure Damage";
    priority = "Medium";
    action = "Send Road Clearance Teams";
  }

  const victimsMatch = text.match(/\d+/);
  const victims = victimsMatch ? victimsMatch[0] : "Unknown";

  setAnalysis({
    category,
    priority,
    victims,
    action,
  });
  let newsMatch = false;
let volunteerReports = false;
let nearbyIncidents = false;

if (text.includes("collapse")) {
  newsMatch = true;
  volunteerReports = true;
  nearbyIncidents = true;
} else if (text.includes("hospital")) {
  newsMatch = true;
  volunteerReports = true;
} else if (text.includes("road")) {
  volunteerReports = true;
  nearbyIncidents = true;
}

let score = 20;

if (newsMatch) score += 30;
if (volunteerReports) score += 30;
if (nearbyIncidents) score += 15;

let status = "UNVERIFIED";

if (score >= 90) {
  status = "VERIFIED";
} else if (score >= 60) {
  status = "LIKELY";
}

setVerification({
  newsMatch,
  volunteerReports,
  nearbyIncidents,
  score,
  status,
});
let resources = [];
let reason = "";

if (priority === "Critical") {
  resources = [
    "🚑 2 Ambulances",
    "👨‍🚒 1 Urban Search & Rescue Team",
    "🚁 1 Helicopter",
  ];

  reason =
    "Building collapse detected with high impact and immediate response needed.";
} else if (priority === "High") {
  resources = [
    "🚑 1 Ambulance",
    "👩‍⚕️ Medical Support Unit",
  ];

  reason =
    "Medical emergency detected requiring rapid intervention.";
} else {
  resources = [
    "🚧 Road Clearance Team",
  ];

  reason =
    "Infrastructure issue detected requiring monitoring and clearance.";
}

setDeployment({
  resources,
  reason,
});

let insights = [];

if (priority === "Critical") {
  insights = [
    "🏥 Hospitals near the incident may exceed capacity within 2 hours.",
    "🚑 Additional rescue teams should be pre-positioned.",
    "🚁 Air evacuation resources may be required.",
  ];
} else if (priority === "High") {
  insights = [
    "👩‍⚕️ Medical support demand is likely to increase.",
    "🚑 Ambulance availability should be monitored.",
    "📦 Emergency supplies may need replenishment.",
  ];
} else {
  insights = [
    "🚧 Road accessibility should be monitored.",
    "📡 Continue gathering verification reports.",
    "👀 Situation should remain under observation.",
  ];
}

setPrediction({
  insights,
});
};
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "white",
        padding: "30px",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ fontSize: "40px" }}>🌍 QuakeShield AI</h1>

      <p style={{ color: "#94a3b8", marginBottom: "30px" }}>
        Multi-Agent Disaster Intelligence Platform for Emergency Response
      </p>

      {/* Top Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <Card title="🚨 Critical Incidents" value="12" />
        <Card title="🚑 Active Resources" value="6" />
        <Card title="👥 Civilians Affected" value="248" />
        <Card title="✅ Verification Rate" value="87%" />
      </div>

      {/* Incident Feed + Resource Status */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <div style={panelStyle}>
          <h2>🚨 Incident Feed</h2>

          <ul>
         {incidentFeed.map((incident, index) => (
        <li key={index}>{incident}</li>
         ))}
        </ul>
        </div>

        <div style={panelStyle}>
          <h2>🚑 Resource Status</h2>

          <p>🚑 Ambulances: {resources.ambulances}</p>
          <p>👨‍🚒 Rescue Teams: {resources.rescueTeams}</p>
          <p>🚁 Helicopters: {resources.helicopters}</p>
          {resources.ambulances === 0 && (
  <p style={{ color: "#f87171" }}>
    ⚠️ Ambulance capacity exhausted.
  </p>
)}

{resources.helicopters === 0 && (
  <p style={{ color: "#f87171" }}>
    ⚠️ No helicopters available.
  </p>
)}
        </div>
      </div>

      {/* Crisis Map + Executive Briefing */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "20px",
        }}
      >
        <div style={panelStyle}>
  <h2>🌍 Crisis Map</h2>

  <MapContainer
    center={[27.7172, 85.3240]}
    zoom={5}
    style={{
      height: "300px",
      width: "100%",
      borderRadius: "10px",
      marginTop: "15px",
    }}
  >
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    <Marker position={[27.7172, 85.3240]}>
      <Popup>
        Kathmandu<br />
        Building Collapse<br />
        Priority: Critical<br />
        Confidence: 95%
      </Popup>
    </Marker>

    <Marker position={[14.5995, 120.9842]}>
      <Popup>
        Manila<br />
        Hospital Overcrowding<br />
        Priority: High<br />
        Confidence: 87%
      </Popup>
    </Marker>

    <Marker position={[27.6710, 85.4298]}>
      <Popup>
        Bhaktapur<br />
        Road Blockage<br />
        Priority: Medium<br />
        Confidence: 65%
      </Popup>
    </Marker>

  </MapContainer>
</div>
        <div style={panelStyle}>
          <h2>📋 Executive Briefing</h2>

          
            <p>{briefing}</p>
          

          <button
  style={{
    marginTop: "20px",
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#3b82f6",
    color: "white",
    fontWeight: "bold",
  }}
>
  ▶ Simulate Earthquake
</button>
        </div>
      </div>
      <div style={{ marginTop: "20px" }}>
  <div style={panelStyle}>
    <h2>🧠 Intake Agent</h2>

    <textarea
      value={incidentText}
      onChange={(e) => setIncidentText(e.target.value)}
      placeholder="Example: School collapsed in Manila. 25 children trapped."
      style={{
        width: "100%",
        minHeight: "100px",
        padding: "10px",
        borderRadius: "10px",
        marginTop: "10px",
      }}
    />

    <button
      onClick={analyzeIncident}
      style={{
  marginTop: "15px",
  padding: "10px 20px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#3b82f6",
  color: "white",
  fontWeight: "bold",
}}
    >
      Analyze Incident
    </button>
    <button
  onClick={simulateEarthquake}
  style={{
    marginTop: "15px",
    marginLeft: "10px",
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
  }}
>
  🌍 Simulate Magnitude 7.2 Earthquake
</button>

    {analysis && (
      <div style={{ marginTop: "20px" }}>
        <h3>Analysis Result</h3>

        <p><strong>Category:</strong> {analysis.category}</p>
        <p><strong>Priority:</strong> {analysis.priority}</p>
        <p><strong>Victims:</strong> {analysis.victims}</p>
        <p><strong>Recommended Action:</strong> {analysis.action}</p>
        {verification && (
  <div style={{ marginTop: "25px" }}>
    <h3>🔍 Verification Report</h3>

    <p>
      📰 News Match: {verification.newsMatch ? "✓" : "✗"}
    </p>

    <p>
      🙋 Volunteer Reports: {verification.volunteerReports ? "✓" : "✗"}
    </p>

    <p>
      📍 Nearby Incidents: {verification.nearbyIncidents ? "✓" : "✗"}
    </p>

    <h3>
      Confidence Score: {verification.score}%
    </h3>

    <h3>
      Status: {verification.status}
    </h3>
  </div>
)}
{deployment && (
  <div style={{ marginTop: "25px" }}>
    <h3>🚨 Prioritization & Resource Allocation</h3>

    <p>
      <strong>Reason:</strong> {deployment.reason}
    </p>

    <div style={{ marginTop: "15px" }}>
  {deployment.resources.map((resource, index) => (
    <p key={index} style={{ margin: "8px 0" }}>
      {resource}
    </p>
  ))}
</div>
  </div>
)}

{prediction && (
  <div style={{ marginTop: "25px" }}>
    <h3>🔮 Predictive Insights</h3>

    <div style={{ marginTop: "15px" }}>
  {prediction.insights.map((insight, index) => (
    <p key={index} style={{ margin: "8px 0" }}>
      {insight}
    </p>
  ))}
</div>
  </div>
)}
{agentLog.length > 0 && (
  <div style={{ marginTop: "25px" }}>
    <h3>🤖 Agent Communication Log</h3>

    <div style={{ marginTop: "15px" }}>
      {agentLog.map((message, index) => (
        <p
          key={index}
          style={{
            margin: "12px 0",
            padding: "12px",
            backgroundColor: "#0f172a",
            borderRadius: "10px",
          }}
        >
          {message}
        </p>
      ))}
    </div>
  </div>
)}
      </div>
    )}
  </div>
</div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div
      style={{
  backgroundColor: "#1e293b",
  padding: "25px",
  borderRadius: "20px",
  boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
}}
    >
      <h3>{title}</h3>
      <h1>{value}</h1>
    </div>
  );
}

const panelStyle = {
  backgroundColor: "#1e293b",
  padding: "25px",
  borderRadius: "20px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
};

export default App;