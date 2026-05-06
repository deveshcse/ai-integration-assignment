import "dotenv/config";
import { connectDb } from "../db/connect.js";
import { HrDocumentModel } from "../features/docs/document.model.js";
import { logger } from "../lib/logger.js";
import { getEmbedding } from "../lib/embeddings.js";

const documents = [
  // ... (keeping the same document content)
  {
    title: "Annual Leave Policy",
    tags: ["leave", "annual", "policy"],
    content: `Meridian Technologies provides all full-time employees with 20 days of paid annual leave per calendar year. Leave begins to accrue from the employee's joining date at a rate proportional to the months worked. Employees who join mid-year will receive a pro-rated entitlement for the remainder of that year.

Employees may carry forward a maximum of 5 unused leave days into the following calendar year. Any leave days beyond this limit will lapse and cannot be encashed or compensated in any form. Encashment of annual leave during employment or upon resignation is not permitted under this policy.

All annual leave requests must be submitted at least two weeks in advance through the official HR portal. Approval is subject to business requirements and manager discretion. In exceptional circumstances, requests with shorter notice may be considered but are not guaranteed. Employees are encouraged to plan leave well in advance, especially during peak project periods, to ensure minimal disruption to team operations.`,
  },
  {
    title: "Sick Leave and Medical Leave Policy",
    tags: ["leave", "sick", "medical"],
    content: `Meridian Technologies recognises that employees may occasionally need time off due to illness or medical conditions. Every full-time employee is entitled to 10 paid sick days per calendar year. These days are non-transferable and do not carry forward to the next year. Unused sick leave at year-end will lapse without any encashment or compensation.

For absences of up to two consecutive days, employees are not required to provide a medical certificate. However, if the absence extends beyond two consecutive working days, a valid doctor's certificate must be submitted to HR within three working days of returning to work.

In cases requiring hospitalisation or surgery, employees may apply for extended medical leave of up to 30 additional days per year, separate from the standard sick leave entitlement. Supporting documentation from a registered medical practitioner or hospital is mandatory for such claims. Employees on extended medical leave will continue to receive their base salary during the approved period.`,
  },
  {
    title: "Work From Home Policy",
    tags: ["wfh", "remote", "policy"],
    content: `Meridian Technologies supports flexible working arrangements where operationally feasible. Eligible employees in qualifying roles may work from home for up to two days per week. Eligibility is determined by the nature of the role, the employee's performance record, and manager approval. Roles that require physical presence, access to on-site equipment, or client-facing responsibilities on-site may not be eligible for WFH arrangements.

All work-from-home requests must be approved by the direct manager in advance. Ad-hoc or last-minute WFH requests should be avoided unless there is a genuine emergency. Employees working from home are expected to adhere to core working hours of 10:00 AM to 4:00 PM IST, during which they must be reachable via company communication channels and able to attend virtual meetings.

The same productivity, quality, and deliverable standards apply regardless of work location. Employees on probation are not eligible for WFH arrangements. The company reserves the right to revoke WFH privileges if performance or attendance standards are not maintained.`,
  },
  {
    title: "Code of Conduct and Professional Behaviour",
    tags: ["conduct", "ethics", "behaviour"],
    content: `At Meridian Technologies, all employees are expected to uphold the highest standards of professional conduct and ethical behaviour. Every employee must communicate respectfully and constructively with colleagues, clients, vendors, and all external stakeholders. Discriminatory, offensive, or demeaning language and behaviour of any form will not be tolerated.

Employees have a duty to maintain the strict confidentiality of all company data, client information, trade secrets, and proprietary materials, both during and after employment. Sharing sensitive information without authorisation — whether intentionally or negligently — may result in disciplinary action and legal consequences.

Any actual or perceived conflicts of interest must be disclosed promptly to the employee's manager and the HR department. Engaging in secondary employment, freelance work, or business activities that compete with or conflict with the company's interests is strictly prohibited without prior written approval from management.

Employees are expected to dress appropriately for the workplace, maintaining a business-casual standard in the office unless otherwise specified for client meetings or company events.`,
  },
  {
    title: "Anti-Harassment and Anti-Discrimination Policy",
    tags: ["harassment", "discrimination", "policy"],
    content: `Meridian Technologies maintains a zero-tolerance policy against all forms of harassment and discrimination in the workplace. This policy applies to all employees, contractors, interns, and visitors. Harassment on the basis of any protected characteristic — including gender, age, religion, caste, disability, sexual orientation, race, or national origin — is strictly prohibited and constitutes grounds for immediate disciplinary action.

Sexual harassment is governed under the Prevention of Sexual Harassment (POSH) Act, 2013. Meridian Technologies has constituted an Internal Complaints Committee (ICC) to receive, investigate, and resolve complaints in a fair and timely manner. The composition of the ICC is published on the company's intranet and reviewed annually.

Any employee who experiences or witnesses harassment or discrimination is encouraged to report the incident to HR or directly to the ICC. All complaints will be treated with confidentiality. Retaliation against an employee for filing a good-faith complaint is strictly prohibited and will itself be treated as a disciplinary offence. Investigations are completed within 90 days of a formal complaint being received.`,
  },
  {
    title: "Onboarding Process for New Employees",
    tags: ["onboarding", "joining", "new-employee"],
    content: `Meridian Technologies is committed to providing every new employee with a structured and welcoming onboarding experience. On the first day, the IT department will set up the employee's laptop, email account, communication tools, and access credentials. New employees will receive a detailed checklist of systems and tools they need to access and configure during their first week.

Each new hire is assigned a buddy — a peer from the same team — who serves as an informal guide for the first 30 days, helping the new employee navigate company culture, processes, and tools. The buddy system is designed to ease the transition and ensure the new employee feels supported.

Managers are responsible for co-creating a personalised 30-60-90 day plan with each new employee, outlining key learning objectives, initial deliverables, and relationship-building goals for the first three months. All new employees must complete mandatory compliance training — including data protection, information security, and the anti-harassment policy — during their first week. An HR orientation session is also held in week one to walk new joiners through benefits, policies, and company values. The standard probation period at Meridian Technologies is six months.`,
  },
  {
    title: "Performance Review Process",
    tags: ["performance", "review", "appraisal"],
    content: `Meridian Technologies conducts formal bi-annual performance reviews in April and October each year. These reviews serve as a structured opportunity for employees and managers to discuss achievements, identify areas of improvement, and align on goals for the upcoming period.

The review cycle begins with the employee completing a self-assessment, which must be submitted to the manager at least one week before the scheduled review meeting. The self-assessment covers key accomplishments, challenges faced, skills developed, and professional development goals. Following the self-assessment, the manager conducts their own evaluation and rates the employee on a 5-point scale across agreed competencies and goal achievement.

Performance ratings are directly linked to annual increment percentages, as outlined in the company's compensation framework published separately. Employees rated consistently low over two consecutive cycles may be placed on a Performance Improvement Plan (PIP). The PIP defines specific improvement targets, a support structure, and a timeline of 60 to 90 days, after which progress is reviewed. Failure to meet PIP targets may result in further HR action.`,
  },
  {
    title: "Expense Reimbursement Policy",
    tags: ["expense", "reimbursement", "finance"],
    content: `Meridian Technologies reimburses employees for reasonable and necessary business expenses incurred in the course of official duties. All reimbursement claims must be accompanied by original receipts or digital invoice copies. Claims without supporting documentation will not be processed.

Business travel expenses including flights, trains, and approved accommodation are reimbursed in full, subject to the travel grade applicable to the employee's designation. For meals incurred during business travel or client meetings, the reimbursement cap is INR 500 per day per person. Cab and auto fares for travel to and from client sites, official events, or the office outside standard commute hours are reimbursable, provided they are booked through the approved corporate travel platform where possible.

All expense claims must be submitted within 30 days of the expense being incurred. Claims older than 30 days will not be entertained except in exceptional circumstances approved by the Finance Head. The submission process is completed via the company's expense management portal. Submitted claims are first reviewed and approved by the employee's manager and then processed by the Finance team within 5-7 working days.`,
  },
];

async function seed(): Promise<void> {
  try {
    await connectDb();
    logger.info("Cleaning existing documents...");
    await HrDocumentModel.deleteMany({});

    logger.info(`Generating embeddings and seeding ${documents.length} documents...`);
    
    const seededDocs = await Promise.all(
      documents.map(async (doc) => {
        const embedding = await getEmbedding(doc.content);
        return { ...doc, embedding };
      })
    );

    await HrDocumentModel.insertMany(seededDocs);
    logger.info("Database seeded successfully with embeddings!");
    process.exit(0);
  } catch (err: unknown) {
    logger.error({ err }, "Seed script failed");
    process.exit(1);
  }
}

seed();
