import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const client = new Pool({
	connectionString: process.env.DATABASE_URL,
});

const createUsersTable = async () => {
	const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      role VARCHAR(50) NOT NULL CHECK (role IN ('seeker', 'recruiter')),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
	try {
		await client.query(query);
		console.log("Users table created successfully.");
	} catch (err) {
		console.error("Error creating users table:", err);
	}
};

// const insertDemoJobs = async () => {
// 	console.log("Inserting demo jobs data...");

// 	// First check if we already have jobs to avoid duplicates
// 	const checkQuery = "SELECT COUNT(*) FROM jobs";
// 	const result = await client.query(checkQuery);

// 	if (result.rows[0].count > 0) {
// 		console.log("Jobs data already exists. Skipping insertion.");
// 		return;
// 	}

// 	const jobsData = [
// 		// TECHNOLOGY JOBS (3)
// 		{
// 			recruiter_id: 2,
// 			title: "Senior Full Stack Developer",
// 			company_name: "Tech Innovations Inc.",
// 			location: "San Francisco, CA",
// 			category: "Technology",
// 			job_type: "Full-time",
// 			experience_level: "Senior",
// 			salary_min: 85000,
// 			salary_max: 150000,
// 			description:
// 				"We are seeking an experienced Full Stack Developer to join our growing engineering team. You will be responsible for developing and maintaining both front-end and back-end components of our SaaS platform. The ideal candidate will have a strong understanding of web technologies and experience building scalable applications.\n\nAs a Full Stack Developer, you will collaborate with cross-functional teams to design, develop, and implement new features while ensuring the technical feasibility of UI/UX designs. You will participate in the entire application lifecycle, focusing on coding and debugging while ensuring high performance and responsiveness.\n\nOur tech stack includes React, Node.js, PostgreSQL, and AWS. We value clean code, test-driven development, and continuous integration practices. We are a remote-first company but offer optional co-working spaces in several cities.\n\nThis is an opportunity to work on cutting-edge technology with a team of passionate engineers who are dedicated to creating exceptional user experiences. We offer competitive compensation, flexible working hours, and opportunities for professional growth.",
// 			status: "active",
// 			posted_date: "2023-01-15",
// 			expiry_date: "2023-04-15",
// 			responsibilities:
// 				"- Develop and maintain both front-end and back-end components of web applications\n- Write clean, maintainable, and efficient code\n- Design and implement database schemas, APIs, and integrations\n- Perform code reviews and mentor junior developers\n- Troubleshoot and debug applications\n- Optimize applications for maximum speed and scalability",
// 			required_skills:
// 				"JavaScript, React, Node.js, PostgreSQL, AWS, RESTful APIs, Git, Agile methodology, TypeScript, CI/CD",
// 		},

// 		{
// 			recruiter_id: 2,
// 			title: "DevOps Engineer",
// 			company_name: "CloudScale Systems",
// 			location: "Remote",
// 			category: "Technology",
// 			job_type: "Full-time",
// 			experience_level: "Mid-Level",
// 			salary_min: 90000,
// 			salary_max: 130000,
// 			description:
// 				"CloudScale Systems is looking for a talented DevOps Engineer to help us build and maintain our cloud infrastructure. This role is critical in ensuring the reliability, security, and scalability of our services. You will work closely with development teams to automate deployment processes and optimize our infrastructure.\n\nThe ideal candidate will have experience with infrastructure as code, CI/CD pipelines, and container technologies. You should be comfortable working in a fast-paced environment and have a passion for automation and solving complex problems.\n\nOur company is at the forefront of cloud technology, helping businesses transform their operations through innovative solutions. We believe in giving our engineers the autonomy to make decisions and the resources they need to succeed.\n\nWe offer a competitive salary, comprehensive benefits package, and the opportunity to work with cutting-edge technologies. Join us and help shape the future of cloud infrastructure.",
// 			status: "active",
// 			posted_date: "2023-02-10",
// 			expiry_date: "2023-05-10",
// 			responsibilities:
// 				"- Design, implement and maintain CI/CD pipelines\n- Configure and manage cloud infrastructure using infrastructure as code\n- Implement monitoring, alerting, and logging solutions\n- Automate manual processes to improve efficiency\n- Collaborate with development teams to improve deployment workflows\n- Troubleshoot and resolve infrastructure and application issues",
// 			required_skills:
// 				"AWS, Kubernetes, Docker, Terraform, Jenkins, Linux, Shell scripting, Python, Prometheus, Git",
// 		},

// 		{
// 			recruiter_id: 2,
// 			title: "Machine Learning Engineer",
// 			company_name: "AI Solutions",
// 			location: "Austin, TX",
// 			category: "Technology",
// 			job_type: "Full-time",
// 			experience_level: "Senior",
// 			salary_min: 110000,
// 			salary_max: 180000,
// 			description:
// 				"AI Solutions is seeking a Machine Learning Engineer to join our fast-growing team. In this role, you will design, develop, and deploy machine learning models to solve complex business problems. You will work with vast datasets to extract insights and build predictive models that power our AI-driven products.\n\nThe ideal candidate has strong mathematical and statistical skills, programming experience in Python, and familiarity with machine learning frameworks. You should have experience taking ML models from research to production and be comfortable working in a collaborative, research-oriented environment.\n\nOur company is focused on creating AI solutions that have real-world impact across industries including healthcare, finance, and retail. We value innovation, rigorous thinking, and a commitment to ethical AI development.\n\nThis position offers the opportunity to work on challenging problems with a team of top-tier ML researchers and engineers. We provide competitive compensation, excellent benefits, and a supportive environment for professional growth.",
// 			status: "active",
// 			posted_date: "2023-03-05",
// 			expiry_date: "2023-06-05",
// 			responsibilities:
// 				"- Design and implement machine learning models to address business problems\n- Process, clean, and verify the integrity of data used for analysis\n- Perform feature engineering and selection\n- Train and optimize models, and evaluate their performance\n- Deploy models to production and monitor their effectiveness\n- Stay current with the latest ML research and technologies",
// 			required_skills:
// 				"Python, TensorFlow, PyTorch, Scikit-learn, SQL, Data Analysis, Statistical Modeling, Deep Learning, NLP, Cloud ML platforms",
// 		},

// 		// FINANCE JOBS (3)
// 		{
// 			recruiter_id: 2,
// 			title: "Financial Analyst",
// 			company_name: "Global Investments Corp",
// 			location: "New York, NY",
// 			category: "Finance",
// 			job_type: "Full-time",
// 			experience_level: "Mid-Level",
// 			salary_min: 75000,
// 			salary_max: 95000,
// 			description:
// 				"Global Investments Corp is seeking a skilled Financial Analyst to join our team in New York. In this role, you will be responsible for analyzing financial data, preparing reports, and providing insights to support business decisions. You will work closely with the finance and executive teams to track company performance and identify areas for improvement.\n\nThe ideal candidate has strong analytical skills, proficiency in financial modeling, and the ability to communicate complex findings clearly. You should be detail-oriented, organized, and able to work with tight deadlines while maintaining accuracy.\n\nGlobal Investments Corp is a leading financial services firm with a reputation for excellence and innovation. We offer our employees opportunities for professional development, mentorship from industry experts, and exposure to diverse financial projects.\n\nThis position provides competitive compensation, comprehensive benefits, and a path for career advancement in a dynamic, fast-paced environment. Join our team and help drive financial success for our clients and our organization.",
// 			status: "active",
// 			posted_date: "2023-01-20",
// 			expiry_date: "2023-04-20",
// 			responsibilities:
// 				"- Analyze financial data and create financial models\n- Prepare monthly, quarterly, and annual financial reports\n- Track KPIs and variance analyses\n- Collaborate with department heads on budgeting and forecasting\n- Research industry trends and perform competitor analysis\n- Support strategic planning and investment decisions",
// 			required_skills:
// 				"Financial Modeling, Excel, SQL, Data Analysis, Accounting Principles, Forecasting, Budgeting, PowerBI, Business Intelligence, Financial Reporting",
// 		},

// 		{
// 			recruiter_id: 2,
// 			title: "Investment Banking Associate",
// 			company_name: "Premier Capital Partners",
// 			location: "Chicago, IL",
// 			category: "Finance",
// 			job_type: "Full-time",
// 			experience_level: "Mid-Level",
// 			salary_min: 100000,
// 			salary_max: 140000,
// 			description:
// 				"Premier Capital Partners is seeking an Investment Banking Associate to join our highly regarded team. In this role, you will support senior bankers in providing financial advisory services to clients, including mergers and acquisitions, capital raising, and strategic alternatives. You will be involved in financial analysis, valuation, due diligence, and client presentations.\n\nThe ideal candidate will have 2-4 years of experience in investment banking or a related field, strong analytical and financial modeling skills, and excellent attention to detail. You should be a team player with exceptional communication skills and the ability to thrive in a fast-paced environment.\n\nPremier Capital Partners is a boutique investment bank known for our personalized approach and deep industry expertise. We provide our associates with significant responsibility and client exposure early in their careers, creating accelerated opportunities for professional growth.\n\nWe offer competitive compensation including base salary and performance bonuses, comprehensive benefits, and a collaborative work environment that values diversity of thought and experience.",
// 			status: "active",
// 			posted_date: "2023-02-15",
// 			expiry_date: "2023-05-15",
// 			responsibilities:
// 				"- Prepare financial analyses, valuations, and models for client engagements\n- Conduct industry and company research to support deal execution\n- Assist in the preparation of client presentations and marketing materials\n- Participate in due diligence activities for transactions\n- Support senior bankers in client meetings and pitches\n- Collaborate with team members on deal execution and closing",
// 			required_skills:
// 				"Financial Modeling, Valuation, M&A, Capital Markets, Excel, PowerPoint, Financial Statement Analysis, LBO Modeling, DCF Analysis, Industry Research",
// 		},

// 		{
// 			recruiter_id: 2,
// 			title: "Risk Management Specialist",
// 			company_name: "Secure Financial Group",
// 			location: "Boston, MA",
// 			category: "Finance",
// 			job_type: "Full-time",
// 			experience_level: "Senior",
// 			salary_min: 95000,
// 			salary_max: 130000,
// 			description:
// 				"Secure Financial Group is seeking an experienced Risk Management Specialist to identify, assess, and mitigate financial and operational risks across our organization. In this role, you will develop and implement risk management strategies, conduct risk assessments, and create comprehensive reports for executive leadership and regulatory bodies.\n\nThe ideal candidate has extensive experience in financial risk management, strong analytical skills, and knowledge of regulatory requirements including Basel III, Dodd-Frank, and CCAR. You should be detail-oriented, proactive, and able to communicate complex risk concepts to diverse stakeholders.\n\nSecure Financial Group is a respected financial institution known for our prudent approach to risk management and commitment to stability. We offer a supportive, collaborative environment where you can apply your expertise to meaningful challenges.\n\nThis position provides competitive compensation, excellent benefits, and opportunities for professional development. Join our team and help ensure the continued security and success of our organization in an ever-changing financial landscape.",
// 			status: "active",
// 			posted_date: "2023-03-10",
// 			expiry_date: "2023-06-10",
// 			responsibilities:
// 				"- Develop and implement risk management frameworks and policies\n- Conduct regular risk assessments and stress tests\n- Monitor key risk indicators and prepare risk reports\n- Collaborate with business units to identify and address potential risks\n- Ensure compliance with regulatory requirements and internal policies\n- Present risk findings and recommendations to leadership",
// 			required_skills:
// 				"Risk Assessment, Regulatory Compliance, Financial Analysis, Basel III, Stress Testing, Credit Risk, Market Risk, Operational Risk, Risk Modeling, Financial Regulations",
// 		},

// 		// MARKETING JOBS (3)
// 		{
// 			recruiter_id: 2,
// 			title: "Digital Marketing Manager",
// 			company_name: "Brand Accelerator",
// 			location: "Los Angeles, CA",
// 			category: "Marketing",
// 			job_type: "Full-time",
// 			experience_level: "Senior",
// 			salary_min: 80000,
// 			salary_max: 120000,
// 			description:
// 				"Brand Accelerator is seeking a talented Digital Marketing Manager to lead our online marketing efforts. In this role, you will be responsible for developing, implementing, and managing marketing campaigns across digital channels to drive brand awareness, engagement, and customer acquisition. You will analyze campaign performance and optimize strategies to maximize ROI.\n\nThe ideal candidate has extensive experience in digital marketing, a data-driven approach, and a deep understanding of current digital marketing trends and best practices. You should be creative, analytical, and able to manage multiple projects simultaneously while maintaining attention to detail.\n\nBrand Accelerator is a dynamic marketing agency working with innovative brands across various industries. We pride ourselves on our creative solutions, measurable results, and collaborative work environment. Our team is passionate about helping brands connect with their audiences in meaningful ways.\n\nThis position offers competitive compensation, comprehensive benefits, and the opportunity to work with exciting brands and talented professionals. Join our team and help shape the future of digital marketing in a rapidly evolving landscape.",
// 			status: "active",
// 			posted_date: "2023-01-25",
// 			expiry_date: "2023-04-25",
// 			responsibilities:
// 				"- Develop and execute comprehensive digital marketing strategies\n- Manage paid advertising campaigns across Google, Meta, LinkedIn, and other platforms\n- Oversee SEO initiatives and content marketing efforts\n- Analyze campaign performance and provide data-driven recommendations\n- Manage email marketing programs and automation\n- Collaborate with creative teams on content development\n- Stay current with digital marketing trends and best practices",
// 			required_skills:
// 				"Digital Advertising, SEO, SEM, Social Media Marketing, Google Analytics, Meta Ads Manager, Content Strategy, Email Marketing, A/B Testing, Marketing Automation",
// 		},

// 		{
// 			recruiter_id: 2,
// 			title: "Content Marketing Specialist",
// 			company_name: "Story Brands",
// 			location: "Denver, CO",
// 			category: "Marketing",
// 			job_type: "Full-time",
// 			experience_level: "Mid-Level",
// 			salary_min: 65000,
// 			salary_max: 85000,
// 			description:
// 				"Story Brands is looking for a Content Marketing Specialist to create compelling content that drives engagement and conversions. In this role, you will develop and execute content strategies across multiple platforms, including blog posts, social media, email newsletters, case studies, and more. You will collaborate with the marketing team to ensure content aligns with brand messaging and marketing objectives.\n\nThe ideal candidate has excellent writing and editing skills, experience with SEO best practices, and the ability to translate complex concepts into engaging content. You should be creative, detail-oriented, and able to manage multiple projects with competing deadlines.\n\nStory Brands is a content-first marketing agency known for helping companies tell their stories in authentic and impactful ways. Our team is passionate about creating content that resonates with audiences and drives measurable business results.\n\nThis position offers competitive compensation, flexible working arrangements, and the opportunity to work with diverse clients across industries. Join our team and help craft compelling stories that connect brands with their audiences.",
// 			status: "active",
// 			posted_date: "2023-02-20",
// 			expiry_date: "2023-05-20",
// 			responsibilities:
// 				"- Create high-quality content for various channels and formats\n- Develop and maintain content calendars\n- Optimize content for SEO and user engagement\n- Collaborate with designers and subject matter experts\n- Monitor content performance and suggest improvements\n- Research industry trends and audience preferences\n- Maintain brand voice and style consistency across all content",
// 			required_skills:
// 				"Content Creation, SEO, Blog Writing, Copywriting, Social Media Content, Content Strategy, Editorial Planning, WordPress, Google Analytics, Keyword Research",
// 		},

// 		{
// 			recruiter_id: 2,
// 			title: "Social Media Manager",
// 			company_name: "Viral Ventures",
// 			location: "Miami, FL",
// 			category: "Marketing",
// 			job_type: "Full-time",
// 			experience_level: "Mid-Level",
// 			salary_min: 60000,
// 			salary_max: 80000,
// 			description:
// 				"Viral Ventures is seeking a creative and strategic Social Media Manager to develop and implement our social media strategy. In this role, you will manage our presence across multiple platforms, create engaging content, grow our following, and drive meaningful engagement with our audience. You will also analyze social media metrics and adjust strategies to maximize performance.\n\nThe ideal candidate has proven experience managing social media accounts for brands, a keen understanding of different social platforms, and the ability to create content that resonates with target audiences. You should be creative, data-savvy, and up-to-date with the latest social media trends and best practices.\n\nViral Ventures is a forward-thinking digital marketing agency specializing in helping brands build authentic connections with their audiences through social media. We work with a diverse portfolio of clients, from startups to established brands, across various industries.\n\nThis position offers competitive compensation, a flexible work environment, and the opportunity to shape the social media presence of exciting brands. Join our team and help create social media strategies that drive real business results.",
// 			status: "active",
// 			posted_date: "2023-03-15",
// 			expiry_date: "2023-06-15",
// 			responsibilities:
// 				"- Develop and implement social media strategies aligned with business goals\n- Create and curate engaging content for multiple social platforms\n- Manage content calendar and posting schedule\n- Respond to comments and messages to foster community engagement\n- Monitor social trends and adapt strategies accordingly\n- Analyze performance metrics and prepare reports\n- Collaborate with marketing and creative teams on campaigns",
// 			required_skills:
// 				"Social Media Management, Content Creation, Community Management, Instagram, TikTok, Twitter, LinkedIn, Facebook, Social Media Analytics, Influencer Relations",
// 		},

// 		// HEALTHCARE JOBS (3)
// 		{
// 			recruiter_id: 2,
// 			title: "Registered Nurse - ICU",
// 			company_name: "Metropolitan Medical Center",
// 			location: "Seattle, WA",
// 			category: "Healthcare",
// 			job_type: "Full-time",
// 			experience_level: "Mid-Level",
// 			salary_min: 75000,
// 			salary_max: 95000,
// 			description:
// 				"Metropolitan Medical Center is seeking a dedicated Registered Nurse to join our Intensive Care Unit team. In this role, you will provide direct patient care to critically ill patients, collaborate with the interdisciplinary healthcare team, and ensure the highest standards of patient safety and quality care. You will monitor patient conditions, administer treatments, and provide education to patients and their families.\n\nThe ideal candidate has ICU experience, strong clinical skills, and exceptional critical thinking abilities. You should be compassionate, detail-oriented, and able to thrive in fast-paced, high-stress environments while maintaining composure and focus on patient care.\n\nMetropolitan Medical Center is a leading healthcare provider known for our commitment to excellent patient outcomes, innovative medical practices, and supportive work environment. We invest in our nursing staff through continuing education, career advancement opportunities, and competitive benefits.\n\nThis position offers competitive compensation, comprehensive healthcare benefits, tuition reimbursement, and a supportive team environment. Join our team and make a difference in the lives of patients when they need it most.",
// 			status: "active",
// 			posted_date: "2023-01-30",
// 			expiry_date: "2023-04-30",
// 			responsibilities:
// 				"- Assess, monitor, and care for critically ill patients\n- Administer medications and treatments as prescribed\n- Document patient information and maintain accurate records\n- Collaborate with physicians and other healthcare professionals\n- Respond quickly to emergency situations\n- Provide emotional support and education to patients and families\n- Maintain a clean and safe environment for patients",
// 			required_skills:
// 				"Critical Care Nursing, Advanced Cardiac Life Support, Ventilator Management, IV Therapy, Medication Administration, Electronic Medical Records, Patient Assessment, Emergency Response, Critical Thinking, Team Collaboration",
// 		},

// 		{
// 			recruiter_id: 2,
// 			title: "Healthcare Data Analyst",
// 			company_name: "Health Metrics Inc.",
// 			location: "Boston, MA",
// 			category: "Healthcare",
// 			job_type: "Full-time",
// 			experience_level: "Mid-Level",
// 			salary_min: 70000,
// 			salary_max: 90000,
// 			description:
// 				"Health Metrics Inc. is seeking a Healthcare Data Analyst to help us transform healthcare data into actionable insights. In this role, you will analyze clinical and operational data, develop reports and dashboards, and provide recommendations to improve healthcare quality, efficiency, and cost-effectiveness. You will work closely with healthcare providers and administrators to understand their data needs and deliver meaningful analyses.\n\nThe ideal candidate has experience with healthcare data, strong analytical skills, and proficiency in data visualization tools. You should be detail-oriented, curious, and able to communicate complex data findings clearly to both technical and non-technical audiences.\n\nHealth Metrics Inc. is a healthcare analytics company dedicated to improving patient care through data-driven insights. Our solutions help healthcare organizations enhance clinical outcomes, optimize operations, and control costs in an increasingly complex healthcare environment.\n\nThis position offers competitive compensation, flexible work arrangements, and the opportunity to make a meaningful impact on healthcare delivery. Join our team and help transform healthcare through the power of data.",
// 			status: "active",
// 			posted_date: "2023-02-25",
// 			expiry_date: "2023-05-25",
// 			responsibilities:
// 				"- Collect, clean, and analyze healthcare data from multiple sources\n- Develop reports, dashboards, and visualizations\n- Identify trends and patterns in healthcare metrics\n- Collaborate with stakeholders to understand data requirements\n- Present findings and recommendations to leadership\n- Support quality improvement and cost-reduction initiatives\n- Ensure data integrity and compliance with privacy regulations",
// 			required_skills:
// 				"SQL, Python, Statistical Analysis, Data Visualization, Healthcare Metrics, HIPAA Compliance, Electronic Health Records, Tableau, PowerBI, Clinical Terminology",
// 		},

// 		{
// 			recruiter_id: 2,
// 			title: "Physical Therapist",
// 			company_name: "Restore Rehabilitation Center",
// 			location: "Denver, CO",
// 			category: "Healthcare",
// 			job_type: "Full-time",
// 			experience_level: "Senior",
// 			salary_min: 80000,
// 			salary_max: 100000,
// 			description:
// 				"Restore Rehabilitation Center is seeking an experienced Physical Therapist to join our growing team. In this role, you will evaluate patients, develop personalized treatment plans, and provide therapeutic interventions to help patients improve mobility, reduce pain, and enhance their quality of life. You will work with patients of all ages recovering from injuries, surgeries, or managing chronic conditions.\n\nThe ideal candidate has a strong background in physical therapy, excellent manual therapy skills, and genuine compassion for patients. You should be patient-focused, detail-oriented, and committed to evidence-based practice and continuing education.\n\nRestore Rehabilitation Center is a respected outpatient facility known for our comprehensive approach to rehabilitation and commitment to patient-centered care. We provide a supportive, collaborative environment where therapists can grow professionally while making a meaningful difference in patients' lives.\n\nThis position offers competitive compensation, excellent benefits including continuing education allowance, and a positive work-life balance. Join our team and help patients achieve their maximum functional potential in a rewarding clinical setting.",
// 			status: "active",
// 			posted_date: "2023-03-20",
// 			expiry_date: "2023-06-20",
// 			responsibilities:
// 				"- Evaluate patients' conditions and develop treatment plans\n- Perform therapeutic exercises and manual therapy techniques\n- Document patient progress and maintain detailed records\n- Educate patients and families on therapeutic exercises and injury prevention\n- Collaborate with other healthcare professionals on patient care\n- Stay current with physical therapy research and best practices\n- Participate in team meetings and quality improvement initiatives",
// 			required_skills:
// 				"Manual Therapy, Therapeutic Exercise, Patient Assessment, Treatment Planning, Rehabilitation Techniques, Musculoskeletal Disorders, Documentation, Patient Education, Team Collaboration, Evidence-Based Practice",
// 		},

// 		// DESIGN JOBS (3)
// 		{
// 			recruiter_id: 2,
// 			title: "UX/UI Designer",
// 			company_name: "Digital Experience Lab",
// 			location: "San Francisco, CA",
// 			category: "Design",
// 			job_type: "Full-time",
// 			experience_level: "Mid-Level",
// 			salary_min: 85000,
// 			salary_max: 120000,
// 			description:
// 				"Digital Experience Lab is seeking a talented UX/UI Designer to create intuitive, engaging user experiences for web and mobile applications. In this role, you will translate user needs, business requirements, and technical considerations into designs that are both functional and visually appealing. You will collaborate with product managers, developers, and stakeholders throughout the design process, from concept to implementation.\n\nThe ideal candidate has a strong portfolio demonstrating user-centered design principles, proficiency in design tools, and experience designing for multiple platforms. You should be creative, detail-oriented, and able to iterate quickly based on feedback and user testing results.\n\nDigital Experience Lab is a design-forward agency known for creating exceptional digital experiences for clients across industries including technology, healthcare, finance, and retail. We believe in human-centered design that solves real problems and delights users.\n\nThis position offers competitive compensation, comprehensive benefits, and the opportunity to work on diverse, challenging projects with a collaborative team. Join us and help shape digital experiences that make a difference.",
// 			status: "active",
// 			posted_date: "2023-02-05",
// 			expiry_date: "2023-05-05",
// 			responsibilities:
// 				"- Create wireframes, prototypes, and high-fidelity designs\n- Conduct user research and usability testing\n- Develop user flows, journey maps, and information architecture\n- Create and maintain design systems and pattern libraries\n- Collaborate with developers to ensure accurate implementation\n- Present designs and articulate design decisions to stakeholders\n- Stay current with UX/UI trends and best practices",
// 			required_skills:
// 				"Figma, Adobe XD, Sketch, User Research, Wireframing, Prototyping, Interaction Design, Visual Design, Design Systems, Usability Testing",
// 		},

// 		{
// 			recruiter_id: 2,
// 			title: "Graphic Designer",
// 			company_name: "Creative Pulse",
// 			location: "Austin, TX",
// 			category: "Design",
// 			job_type: "Full-time",
// 			experience_level: "Mid-Level",
// 			salary_min: 60000,
// 			salary_max: 85000,
// 			description:
// 				"Creative Pulse is seeking a talented Graphic Designer to create visually compelling content across various media. In this role, you will design marketing materials, brand assets, social media graphics, and other visual content that effectively communicates our clients' messages and enhances their brand identity. You will work collaboratively with the creative team to develop concepts and execute designs that meet client objectives.\n\nThe ideal candidate has a strong portfolio showing versatility across different design styles and mediums, proficiency in Adobe Creative Suite, and a solid understanding of design principles. You should be creative, detail-oriented, and able to manage multiple projects with competing deadlines.\n\nCreative Pulse is a boutique design agency known for our innovative approach and commitment to excellence. We work with a diverse range of clients, from startups to established brands, across various industries. Our collaborative environment encourages creativity and professional growth.\n\nThis position offers competitive compensation, a flexible work environment, and opportunities to expand your design skills across different projects and mediums. Join our team and help bring brand stories to life through compelling visual design.",
// 			status: "active",
// 			posted_date: "2023-03-25",
// 			expiry_date: "2023-06-25",
// 			responsibilities:
// 				"- Create visual concepts and designs for digital and print media\n- Design brand identity elements including logos, color palettes, and typography\n- Produce marketing materials such as brochures, presentations, and advertisements\n- Create social media graphics and digital assets\n- Ensure brand consistency across all design deliverables\n- Collaborate with copywriters, marketers, and other team members\n- Present design concepts and incorporate feedback from clients and team members",
// 			required_skills:
// 				"Adobe Photoshop, Adobe Illustrator, Adobe InDesign, Typography, Color Theory, Brand Identity Design, Layout Design, Digital Design, Print Design, Visual Communication",
// 		},

// 		{
// 			recruiter_id: 2,
// 			title: "Product Designer",
// 			company_name: "Innovative Products Inc.",
// 			location: "Portland, OR",
// 			category: "Design",
// 			job_type: "Full-time",
// 			experience_level: "Senior",
// 			salary_min: 90000,
// 			salary_max: 130000,
// 			description:
// 				"Innovative Products Inc. is seeking a skilled Product Designer to join our design team. In this role, you will design physical products that balance form and function, creating experiences that delight users while solving real problems. You will take products from concept to production, collaborating with engineering, marketing, and manufacturing teams throughout the process.\n\nThe ideal candidate has a strong portfolio demonstrating experience designing consumer products, proficiency in 3D modeling and rendering software, and understanding of manufacturing processes and constraints. You should be creative, practical, and able to iterate based on technical feedback and user insights.\n\nInnovative Products Inc. is a consumer goods company known for creating thoughtfully designed products that improve everyday life. Our team is passionate about design that makes a difference, with a focus on sustainability, usability, and aesthetic appeal.\n\nThis position offers competitive compensation, excellent benefits, and the opportunity to see your designs transform from concepts to market-ready products. Join our team and help create the next generation of innovative consumer products that have a positive impact on people's lives.",
// 			status: "active",
// 			posted_date: "2023-01-10",
// 			expiry_date: "2023-04-10",
// 			responsibilities:
// 				"- Create product concepts and designs based on user needs and market research\n- Develop sketches, renderings, and physical prototypes\n- Create detailed design specifications for manufacturing\n- Collaborate with engineers to ensure design feasibility\n- Conduct user testing and iterate designs based on feedback\n- Present design concepts to stakeholders and incorporate feedback\n- Stay current with design trends, materials, and manufacturing technologies",
// 			required_skills:
// 				"Industrial Design, 3D Modeling, SolidWorks, Rhino, Product Prototyping, Manufacturing Processes, Materials Knowledge, Rendering, Design Thinking, User-Centered Design",
// 		},
// 	];

// 	// Build parameterized query for all jobs
// 	const insertQuery = `
//     INSERT INTO jobs (
//       recruiter_id, title, company_name, location, category,
//       job_type, experience_level, salary_min, salary_max,
//       description, status, posted_date, expiry_date,
//       responsibilities, required_skills
//     )
//     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
//   `;

// 	try {
// 		// Insert each job with proper parameters
// 		for (const job of jobsData) {
// 			await client.query(insertQuery, [
// 				job.recruiter_id,
// 				job.title,
// 				job.company_name,
// 				job.location,
// 				job.category,
// 				job.job_type,
// 				job.experience_level,
// 				job.salary_min,
// 				job.salary_max,
// 				job.description,
// 				job.status,
// 				job.posted_date,
// 				job.expiry_date,
// 				job.responsibilities,
// 				job.required_skills,
// 			]);
// 		}

// 		console.log(`✅ Successfully inserted ${jobsData.length} demo jobs`);
// 	} catch (error) {
// 		console.error("Error inserting demo jobs:", error);
// 	}
// };

const createJobsTable = async () => {
	const query = `
    CREATE TABLE IF NOT EXISTS jobs (
      id SERIAL PRIMARY KEY,
      recruiter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      company_name TEXT NOT NULL,
      location TEXT NOT NULL,
      category TEXT NOT NULL,
      job_type VARCHAR(50) NOT NULL,
      experience_level VARCHAR(50) NOT NULL,
      salary_min INTEGER NOT NULL,
      salary_max INTEGER NOT NULL,
      description TEXT NOT NULL,
      status VARCHAR(50) NOT NULL, CHECK (status IN ('active', 'close', 'draft')),
      posted_date DATE NOT NULL,
      expiry_date DATE NOT NULL,
      responsibilities TEXT,
      required_skills TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
	try {
		await client.query(query);
		console.log("Jobs table created successfully.");
	} catch (err) {
		console.error("Error creating jobs table:", err);
	}
};

const createApplicationsTable = async () => {
	const query = `
    CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY,
      job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      seeker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      resume TEXT NOT NULL,
      position TEXT NOT NULL,
      cover_letter TEXT,
      motivationQuestion TEXT,
      uniqueQuestion TEXT,
      status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
      viewed_by_recruiter BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
	try {
		await client.query(query);
		console.log("Applications table created successfully.");
	} catch (err) {
		console.error("Error creating applications table:", err);
	}
};

const createNotificationsTable = async () => {
	const query = `
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      related_id INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
	try {
		await client.query(query);
		console.log("Notifications table created successfully.");
	} catch (err) {
		console.error("Error creating notifications table:", err);
	}
};

const createDemoInterviewsTable = async () => {
	const query = `
    CREATE TABLE IF NOT EXISTS demo_interviews (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Renamed from seeker_id for consistency
      job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      application_id INTEGER REFERENCES applications(id) ON DELETE SET NULL, -- Use SET NULL or CASCADE based on desired behavior
      transcript JSONB, -- Store transcript objects
      completed_at TIMESTAMPTZ DEFAULT NOW(),
      vapi_call_id TEXT, -- Keep if needed

      -- Renamed feedback fields for clarity and consistency
      feedback_summary TEXT,
      feedback_recommendation TEXT,
      feedback_recommendation_msg TEXT,
      rating_technical DECIMAL(3,1), -- Use DECIMAL for ratings if needed
      rating_communication DECIMAL(3,1),
      rating_problem_solving DECIMAL(3,1),
      rating_experience DECIMAL(3,1),
      score DECIMAL(3,1), -- Optional overall score (can be calculated or from LLM)

      created_at TIMESTAMPTZ DEFAULT NOW() -- Added created_at if missing
      -- removed duplicate completed_at
    )
  `;

	try {
		await client.query(query);
		console.log("Demo Interviews table checked/created successfully.");
	} catch (err) {
		console.error("Error creating demo interviews table:", err);
	}
};

// Call functions to create the tables
const initializeTables = async () => {
	await createUsersTable();
	await createJobsTable();
	await createApplicationsTable();
	await createNotificationsTable();
	await createDemoInterviewsTable();

	// await insertDemoJobs();
};

initializeTables();

export default client;
