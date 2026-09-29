# VISTA
Velocity based Intelligence for Stress Trajectory Analysis

Proposal Title
VISTA - Velocity based Intelligence for Stress Trajectory Analysis

Problem Understanding
Financial problems usually do not start with a missed payment. They build up slowly.
A person may start receiving their salary a few days late, use more of their savings than usual, depend more on credit, delay regular payments, or have an unexpected increase in expenses. Each of these changes, when seen separately, may not look serious. But when several of them happen together and continue over time, they can be early signs that the person is heading towards financial difficulty.
The problem is that most financial systems mainly react to visible events such as a failed payment, overdue EMI, or default. By that stage, the customer's financial situation may have already deteriorated significantly, and the institution has fewer options to provide timely support.
What is missing is an understanding of the **direction in which a customer's financial situation is moving**.
Two customers can have the same balance, income, or credit score today, while one is financially stable and the other is rapidly moving towards financial stress. A static view cannot clearly distinguish between them.
We therefore see a need for a system that can look at small changes in financial behaviour over time, understand how quickly those changes are developing, identify the type of financial pressure involved, and provide an early indication of where the situation may be heading.
The goal is not to wait for a customer to become a defaulter and then start recovery. It is to recognise the warning signs early enough for meaningful and appropriate support to be considered.

Solution Description
FinancialWeather is an early-warning and intervention system designed to identify financial stress before it develops into missed payments or default. The system looks beyond a customer’s current financial position and focuses on how their financial situation is changing over time.

FinancialWeather analyses signals such as income patterns, savings and account balance, recurring payments, failed auto-debits, credit utilisation, spending behaviour and payment timing. These signals are compared with the customer’s own historical behaviour to identify meaningful changes from their normal financial pattern.

The solution works through the following stages:
• Personal Financial Baseline: Establishes the customer’s normal financial behaviour and detects deviations from it.
• Financial Pressure Detection:Combines multiple changes to identify whether financial pressure is building.
• Velocity & Acceleration Analysis: Measures how quickly the financial situation is changing and whether the deterioration is becoming faster.
• Financial Stress Classification: Identifies the type of emerging stress, such as liquidity pressure, income shock, debt pressure, payment stress, spending pressure or compound financial stress.
• Trajectory Forecasting: Estimates where the customer’s financial condition may be heading and provides the major factors contributing to the forecast.
• Explainable Recommendations: Shows the key signals behind the detected condition so that financial teams can understand why an alert was generated.
• Personalised Intervention: Uses Generative AI to assist in creating context-specific communication and support instead of sending the same generic message to every customer.
• Human-in-the-Loop: Keeps important financial decisions under appropriate human review rather than allowing the system to make high-impact decisions automatically.
• Outcome Tracking: Monitors the customer’s condition after intervention and uses the outcome to improve future detection and recommendations.
For example, a customer may still be making all payments on time, but if their income is declining, savings are being depleted, credit utilisation is increasing and recurring payments are gradually being delayed, FinancialWeather can recognise that these changes are forming a larger pattern of financial pressure.

The overall process is:
Financial Activity → Early Signals → Pressure Detection → Velocity & Acceleration → Stress Classification → Forecast → Explainable Recommendation → Human Review → Personalised Intervention → Outcome Tracking

The goal is to move financial institutions from **reacting to financial distress after it becomes visible to recognising the early signs and providing timely, relevant support while there is still an opportunity to prevent the situation from becoming critical.

Implementation Approach
FinancialWeather will be implemented as a layered architecture that moves from financial data collection to signal analysis, financial stress detection, forecasting and intervention. Each layer will have a specific responsibility while working together as a continuous pipeline.

Layer 1 — Data Ingestion Layer
The first layer collects the financial events required for analysis. The system can process historical financial records as well as simulated real-time transaction events for the prototype. The data can include income and salary transactions, account balances, savings movement, recurring payments, loan and EMI payments, credit utilisation, spending behaviour, payment timing and failed auto-debits. The system will focus only on the financial information required for detecting changes in financial behaviour.

Layer 2 — Data Processing and Personal Baseline Layer
The collected data will be cleaned, normalised and converted into meaningful customer-level features. Since every customer has a different financial pattern, the system will establish a personal baseline from their historical behaviour. New financial activity will then be compared against this baseline to identify meaningful deviations. This makes the system more sensitive to changes in an individual's normal financial behaviour rather than depending only on fixed thresholds applied to everyone.

Layer 3 — Financial Signal Layer
The processed data will be converted into a set of financial signals that represent different aspects of the customer's financial condition. These signals will cover areas such as income stability, salary timing, liquidity movement, payment behaviour, failed recurring payments, credit utilisation and spending changes. The signals will be continuously updated as new financial activity becomes available.

Layer 4 — Financial Pressure and Dynamic Analysis Layer
The system will combine the financial signals to determine whether financial pressure is building, remaining stable or reducing. Instead of only looking at the current value of a financial indicator, the system will analyse its movement over time.
Two important measures will be used:
• Velocity measures how quickly a financial signal or overall financial condition is changing.
• Acceleration measures whether that rate of change is increasing or decreasing.
This allows the system to distinguish between a customer whose financial condition is changing gradually and one whose financial condition is deteriorating rapidly.

Layer 5 — Financial Stress Classification Layer
Once changes in financial behaviour are detected, the system will classify the emerging financial condition. The classification will help determine the nature of the financial pressure rather than treating every customer as having the same type of risk.
Possible categories include liquidity pressure, income shock, debt pressure, payment stress, spending pressure and compound financial stress. The classification will be based on the combination, persistence and movement of multiple financial signals.

Layer 6 — Financial Forecasting Layer
The forecasting layer will use the customer's historical behaviour, current financial condition, financial signals, velocity and acceleration to estimate the likely direction of their financial situation.
The purpose is not simply to predict whether a customer will default. Instead, the system will identify whether financial pressure is likely to increase, remain stable or improve and provide an indication of the potential progression of the detected financial condition.
The forecast will also consider the major signals contributing to the predicted trajectory, allowing financial teams to understand what is driving the developing situation.

Layer 7 — Explainability Layer
The system will provide an explanation for every significant prediction or classification. Explainable AI techniques such as SHAP can be used to identify the financial signals that contributed most to the model's output.
This allows the financial institution to understand why a particular customer was identified as experiencing increasing financial pressure instead of receiving only an unexplained prediction or score.

Layer 8 — Intervention Recommendation Layer
After identifying the financial condition and its expected trajectory, the system will generate an appropriate intervention recommendation. The recommendation will depend on the type and severity of financial pressure detected.
Generative AI can assist in preparing personalised customer communication based on the identified financial situation. This allows the institution to move away from generic payment reminders and towards communication that is more relevant to the customer's circumstances.
The system will act as a decision-support mechanism rather than independently making significant financial decisions.

Layer 9 — Human Review and Governance Layer
Recommendations involving significant financial actions will be reviewed by an authorised financial or relationship-management team. The reviewer will have access to the detected condition, contributing signals, forecast and recommended response before taking action.
This human-in-the-loop approach ensures that automated predictions support financial professionals rather than replacing human judgement in sensitive situations.

Layer 10 — Blockchain Audit Layer
The Drunix blockchain infrastructure can be used to maintain an auditable record of important intervention events. Instead of storing sensitive customer information directly on the blockchain, the system can use hashed or reference-based information to maintain the history of significant decisions.
The audit layer can record the detected financial condition, contributing factors, recommendation, approval, intervention and outcome. This provides a tamper-evident record of the decision process and improves transparency and accountability.

Layer 11 — Outcome Tracking and Feedback Layer
The final layer monitors what happens after an intervention. Changes in financial behaviour, repayment stability and other relevant signals can be tracked to determine whether the customer's condition improves, remains unchanged or continues to deteriorate.
The outcomes can then be fed back into the system to evaluate the effectiveness of different interventions and improve future predictions and recommendations.
This creates a continuous cycle of detection, analysis, forecasting, intervention and learning.

The complete system will follow this architecture:
Financial Data Ingestion → Data Processing → Personal Baseline → Financial Signals → Pressure Analysis → Velocity and Acceleration → Stress Classification → Financial Forecasting → Explainable Recommendation → Human Review → Intervention → Outcome Tracking → Continuous Improvement

The prototype can be implemented using React.js for the frontend, Node.js and Express.js for backend services, Python and FastAPI for machine-learning services, PostgreSQL or MongoDB for data storage, Kafka for simulated real-time financial events, and SHAP for explainability. Generative AI will be used for personalised communication, while the Drunix blockchain layer will provide an auditable record for important intervention decisions and outcomes.

Technology Stack
Frontend: React.js, Tailwind CSS, Recharts/ECharts, Socket.IO • Backend: Node.js, Express.js, REST APIs, WebSockets • Data Ingestion: Apache Kafka for real-time financial event streaming and Kafka consumers/producers • Databases: PostgreSQL for structured financial and transactional data, MongoDB for flexible behavioural, signal and ML data • Caching: Redis for fast access, real-time state and notifications • Data Processing: Python, Pandas, NumPy, Scikit-learn • Machine Learning: XGBoost for financial risk analysis, LightGBM for behavioural pattern detection, Isolation Forest for anomaly detection • Forecasting: Time-series analysis, trajectory analysis, velocity and acceleration calculations • Explainable AI: SHAP for identifying the major factors behind predictions • Generative AI: LLM-based personalised communication and intervention recommendations • ML Services: Python, FastAPI, Uvicorn, Pydantic • Blockchain: Drunix for auditable intervention and decision records • Security: TLS 1.3, AES-256, JWT/OAuth 2.0, RBAC and hashed customer identifiers • Deployment: Docker, Docker Compose, Nginx, Ubuntu/Linux • DevOps: GitHub, GitHub Actions, Prometheus and Grafana

Expected Impact
• Early detection of financial stress before it develops into missed payments or default.
• Reduced financial losses by allowing institutions to identify deteriorating customer situations earlier and take timely action.
• Better customer experience through personalised and supportive interventions instead of generic payment reminders.
• Improved decision-making by providing financial teams with clear explanations of the signals contributing to each prediction.
• Better allocation of relationship-management and support resources by prioritising customers based on the severity and direction of their financial condition.
• Reduced dependence on reactive collections by shifting towards proactive financial support.
• Continuous improvement through outcome tracking, allowing the system to learn which interventions are more effective for different financial situations.
• Greater transparency and accountability through explainable AI and an auditable record of important intervention decisions.
• Scalable financial intelligence that can eventually be applied across individual customers, small businesses and larger financial portfolios.

GitHub Repository URL: 
Pitch Deck URL : 
