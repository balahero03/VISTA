# VISTA

**Velocity-based Intelligence for Stress Trajectory Analysis**

An early-warning and decision-support system that detects emerging financial stress in customers before it materialises as missed payments or default.

---

## Proposal Title

VISTA — Velocity-based Intelligence for Stress Trajectory Analysis

---

## Problem Understanding

Financial distress rarely begins with a missed payment. It accumulates gradually.

A customer may begin receiving salary credits a few days late, draw down savings faster than usual, increase reliance on credit, delay recurring payments, or absorb an unexpected rise in expenses. Individually, each of these changes appears insignificant. Occurring together and persisting over time, they constitute an early indication that the customer is moving towards financial difficulty.

Most financial systems are reactive. They respond to visible events — a failed auto-debit, an overdue EMI, a default. By the time such an event occurs, the customer's position has often deteriorated substantially and the institution's available remedies are limited.

What existing systems do not capture is the **direction in which a customer's financial position is moving**.

Two customers may present an identical balance, income and credit score today, while one is financially stable and the other is deteriorating rapidly. A static assessment cannot distinguish between them.

There is therefore a need for a system that observes incremental changes in financial behaviour over time, quantifies the rate at which those changes are developing, identifies the nature of the financial pressure involved, and indicates the likely trajectory of the customer's position.

The objective is not to wait for default and then initiate recovery. It is to identify the warning indicators early enough for appropriate and timely support to be considered.

---

## Solution Description

VISTA is an early-warning and intervention system designed to identify financial stress before it develops into missed payments or default. The system looks beyond a customer's current financial position and evaluates how that position is changing over time.

VISTA analyses signals including income patterns, savings and account balance movement, recurring payments, failed auto-debits, credit utilisation, spending behaviour and payment timing. These signals are evaluated against the customer's own historical behaviour to identify meaningful deviations from their established financial pattern.

The system operates through the following stages:

- **Personal Financial Baseline** — Establishes the customer's normal financial behaviour and detects deviations from it.
- **Financial Pressure Detection** — Combines multiple deviations to determine whether financial pressure is building.
- **Velocity and Acceleration Analysis** — Measures how rapidly the financial position is changing and whether that deterioration is itself accelerating.
- **Financial Stress Classification** — Identifies the nature of the emerging stress: liquidity pressure, income shock, debt pressure, payment stress, spending pressure or compound financial stress.
- **Trajectory Forecasting** — Estimates the likely direction of the customer's financial position and identifies the principal contributing factors.
- **Explainable Recommendations** — Surfaces the key signals behind each detected condition so that financial teams can understand why an alert was generated.
- **Personalised Intervention** — Applies generative AI to produce context-specific customer communication in place of uniform generic messaging.
- **Human-in-the-Loop Review** — Retains material financial decisions under authorised human review rather than permitting automated high-impact action.
- **Outcome Tracking** — Monitors the customer's position following intervention and feeds the observed outcome back into detection and recommendation.

**Illustrative case:** a customer may continue to meet all payments on schedule. If, concurrently, income is declining, savings are depleting, credit utilisation is rising and recurring payments are progressively delayed, VISTA identifies these movements as a coherent pattern of building financial pressure.

**Process flow:**

```
Financial Activity → Early Signals → Pressure Detection → Velocity and Acceleration
→ Stress Classification → Forecast → Explainable Recommendation → Human Review
→ Personalised Intervention → Outcome Tracking
```

The objective is to move financial institutions from reacting to distress once it becomes visible, towards recognising early indicators and providing timely, relevant support while intervention remains effective.

---

## Implementation Approach

VISTA is implemented as a layered architecture progressing from financial data collection through signal analysis, stress detection, forecasting and intervention. Each layer carries a defined responsibility while operating as part of a continuous pipeline.

### Layer 1 — Data Ingestion

Collects the financial events required for analysis. The system processes historical financial records as well as simulated real-time transaction events for the prototype. Inputs include income and salary transactions, account balances, savings movement, recurring payments, loan and EMI payments, credit utilisation, spending behaviour, payment timing and failed auto-debits. Only financial information relevant to detecting behavioural change is retained.

### Layer 2 — Data Processing and Personal Baseline

Cleans and normalises collected data and derives customer-level features. As every customer exhibits a distinct financial pattern, the system establishes a personal baseline from historical behaviour. Incoming activity is evaluated against this baseline to identify meaningful deviation. This makes detection sensitive to change within an individual's own pattern rather than dependent on fixed thresholds applied uniformly across a population.

### Layer 3 — Financial Signal Generation

Converts processed data into a set of financial signals representing distinct aspects of the customer's position. Signals cover income stability, salary timing, liquidity movement, payment behaviour, failed recurring payments, credit utilisation and spending change. Signals are updated continuously as new financial activity is received.

### Layer 4 — Financial Pressure and Dynamic Analysis

Combines the financial signals to determine whether pressure is building, stable or reducing. Rather than evaluating only the current value of an indicator, the system analyses its movement over time using two measures:

- **Velocity** — the rate at which a financial signal or the overall financial condition is changing.
- **Acceleration** — whether that rate of change is itself increasing or decreasing.

This distinguishes a customer whose position is changing gradually from one deteriorating rapidly.

### Layer 5 — Financial Stress Classification

Classifies the emerging financial condition once behavioural change is detected, establishing the nature of the pressure rather than treating all customers as carrying an equivalent form of risk. Categories include liquidity pressure, income shock, debt pressure, payment stress, spending pressure and compound financial stress. Classification is based on the combination, persistence and movement of multiple signals.

### Layer 6 — Financial Forecasting

Uses historical behaviour, current condition, financial signals, velocity and acceleration to estimate the likely direction of the customer's position.

The purpose is not solely to predict default. The system determines whether financial pressure is likely to increase, remain stable or improve, and indicates the potential progression of the detected condition. The forecast identifies the principal signals contributing to the projected trajectory, allowing financial teams to understand what is driving the developing situation.

### Layer 7 — Explainability

Provides an explanation for every significant prediction or classification. Explainable AI techniques such as SHAP identify the signals contributing most to each model output.

This enables the institution to understand why a specific customer was identified as experiencing increasing financial pressure, rather than receiving an unexplained score.

### Layer 8 — Intervention Recommendation

Generates an appropriate intervention recommendation based on the identified condition and its expected trajectory. The recommendation is determined by the type and severity of pressure detected.

Generative AI assists in preparing personalised customer communication aligned to the identified situation, moving the institution away from generic payment reminders towards communication relevant to the customer's circumstances. The system functions as a decision-support mechanism and does not independently execute material financial decisions.

### Layer 9 — Human Review and Governance

Recommendations involving material financial action are reviewed by an authorised financial or relationship-management team. The reviewer is presented with the detected condition, contributing signals, forecast and recommended response before acting.

This human-in-the-loop model ensures automated predictions support financial professionals rather than replacing human judgement in sensitive circumstances.

### Layer 10 — Blockchain Audit

The Drunix blockchain infrastructure maintains an auditable record of material intervention events. Rather than storing sensitive customer information on-chain, the system records hashed or reference-based information representing the history of significant decisions.

The audit layer records the detected condition, contributing factors, recommendation, approval, intervention and outcome, providing a tamper-evident record of the decision process and improving transparency and accountability.

### Layer 11 — Outcome Tracking and Feedback

Monitors outcomes following intervention. Changes in financial behaviour, repayment stability and related signals are tracked to determine whether the customer's condition improves, remains unchanged or continues to deteriorate.

Observed outcomes are returned to the system to evaluate the effectiveness of different interventions and refine future predictions and recommendations, establishing a continuous cycle of detection, analysis, forecasting, intervention and learning.

### System Architecture

```
Financial Data Ingestion → Data Processing → Personal Baseline → Financial Signals
→ Pressure Analysis → Velocity and Acceleration → Stress Classification
→ Financial Forecasting → Explainable Recommendation → Human Review
→ Intervention → Outcome Tracking → Continuous Improvement
```

---

## Technology Stack

| Area | Technologies |
|---|---|
| Frontend | React.js, Tailwind CSS, Recharts / ECharts, Socket.IO |
| Backend | Node.js, Express.js, REST APIs, WebSockets |
| Data Ingestion | Apache Kafka for real-time financial event streaming, Kafka producers and consumers |
| Databases | PostgreSQL for structured financial and transactional data; MongoDB for behavioural, signal and ML data |
| Caching | Redis for low-latency access, real-time state and notifications |
| Data Processing | Python, Pandas, NumPy, Scikit-learn |
| Machine Learning | XGBoost for financial risk analysis, LightGBM for behavioural pattern detection, Isolation Forest for anomaly detection |
| Forecasting | Time-series analysis, trajectory analysis, velocity and acceleration computation |
| Explainable AI | SHAP for attribution of model outputs to contributing signals |
| Generative AI | LLM-based personalised communication and intervention recommendation |
| ML Services | Python, FastAPI, Uvicorn, Pydantic |
| Blockchain | Drunix for auditable intervention and decision records |
| Security | TLS 1.3, AES-256, JWT / OAuth 2.0, RBAC, hashed customer identifiers |
| Deployment | Docker, Docker Compose, Nginx, Ubuntu / Linux |
| DevOps | GitHub, GitHub Actions, Prometheus, Grafana |

---

## Expected Impact

- Early detection of financial stress before it develops into missed payments or default.
- Reduced financial losses through earlier identification of deteriorating customer positions and timely action.
- Improved customer experience through personalised, supportive intervention in place of generic payment reminders.
- Better institutional decision-making through clear explanation of the signals contributing to each prediction.
- More effective allocation of relationship-management and support resources by prioritising customers on severity and direction of condition.
- Reduced dependence on reactive collections in favour of proactive financial support.
- Continuous improvement through outcome tracking, establishing which interventions are effective for which financial situations.
- Greater transparency and accountability through explainable AI and an auditable record of material intervention decisions.
- Scalable financial intelligence applicable across individual customers, small businesses and larger financial portfolios.

---

## Submission

**GitHub Repository URL:**

**Pitch Deck URL:**
