import { QetaStore } from '../database/QetaStore';
import {
  LoggerService,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
  SchedulerService,
  SchedulerServiceTaskScheduleDefinition,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';

const TAGS: Record<string, string> = {
  backstage: 'Backstage is an open platform for building developer portals.',
  javacript:
    'JavaScript (a dialect of ECMAScript) is a high-level, multi-paradigm, object-oriented, prototype-based, dynamically-typed, and interpreted language traditionally used for client-side scripting in web browsers.',
  python:
    'Python is an interpreted, interactive, object-oriented (using classes), dynamic and strongly typed programming language that is used for a wide range of applications.',
  java: 'Java is a high-level, platform-independent, object-oriented, functional programming language and runtime environment.',
  'c#': 'c# is a multi-paradigm programming language including object-oriented programming, functional programming, and imperative programming created by Microsoft in conjunction with .NET.',
  php: 'PHP is a widely used, open source, general-purpose, multi-paradigm, dynamically typed and interpreted scripting language designed initially for server-side web development.',
  android:
    'Android is a mobile operating system developed by a consortium of developers known as the Open Handset Alliance, with the main contributor and commercial marketer being Google.',
  html: 'HTML (HyperText Markup Language) is the markup language used for structuring web pages and other information to be displayed in a web browser.',
  jquery:
    'jQuery (Core) is a cross-browser JavaScript library (created by John Resig) that provides abstractions for common client-side tasks such as DOM traversal, DOM manipulation, event handling, animation, and AJAX.',
  'c++':
    'C++ is a (mostly) statically-typed, free-form, (usually) compiled, multi-paradigm, intermediate-level general-purpose programming language; not to be confused with C or C++/CLI.',
  css: 'CSS, or Cascading Style Sheets, is a language used to control the visual presentation of documents written in a markup language, including HTML, XML, XHTML, SVG, and XUL.',
  ios: 'iOS is the mobile operating system running on the Apple iPhone, iPod touch, and iPad. It shares common frameworks and other components including Cocoa Touch.',
  sql: 'Structured Query Language (SQL) is a language for querying databases.',
  mysql:
    'MySQL is an open-source relational database management system (RDBMS) that is based on SQL (Structured Query Language).',
  reactjs:
    'React (also known as React.js or ReactJS) is a JavaScript library for building user interfaces.',
  nodejs:
    'Node.js is an open-source, cross-platform, JavaScript runtime environment that executes JavaScript code outside a web browser.',
  angularjs:
    'AngularJS is a JavaScript-based open-source front-end web application framework.',
  typescript:
    'TypeScript is a superset of JavaScript that compiles to plain JavaScript.',
  vuejs:
    'Vue.js is an open-source JavaScript framework for building user interfaces and single-page applications.',
  ruby: 'Ruby is a dynamic, open-source, object-oriented programming language.',
  'objective-c':
    'Objective-C is a general-purpose, object-oriented programming language that adds Smalltalk-style messaging to the C programming language.',
  swift:
    'Swift is a general-purpose, multi-paradigm, compiled programming language developed by Apple Inc.',
  'asp.net':
    'ASP.NET is an open-source server-side web application framework designed for web development to produce dynamic web pages.',
  c: 'C is a general-purpose, procedural computer programming language supporting structured programming, lexical variable scope, and recursion, with a static type system.',
  rust: 'Rust is a systems programming language focused on safety, speed, and concurrency.',
  go: 'Go is a statically typed, compiled programming language designed at Google.',
  kotlin:
    'Kotlin is a statically typed programming language that runs on the Java virtual machine and can also be compiled to JavaScript source code or use the LLVM compiler infrastructure.',
  scala:
    'Scala is a general-purpose programming language providing support for functional programming and a strong static type system.',
  git: 'Git is a distributed version control system for tracking changes in source code during software development.',
  github: 'GitHub is a web-based platform for version control using Git.',
  gitlab:
    'GitLab is a web-based DevOps lifecycle tool that provides a Git repository manager providing wiki, issue-tracking, and CI/CD pipeline features.',
  bitbucket:
    'Bitbucket is a web-based version control repository hosting service owned by Atlassian.',
  docker:
    'Docker is a platform for developing, shipping, and running applications in containers.',
  kubernetes:
    'Kubernetes is an open-source container-orchestration system for automating application deployment, scaling, and management.',
  regex:
    'Regular expressions (regex or regexp) are a sequence of characters that define a search pattern.',
  linux:
    'Linux is a family of open-source Unix-like operating systems based on the Linux kernel.',
  windows:
    'Microsoft Windows is a group of several graphical operating system families, all of which are developed, marketed, and sold by Microsoft.',
  macos:
    'macOS is a series of proprietary graphical operating systems developed and marketed by Apple Inc.',
  unix: 'Unix is a family of multitasking, multiuser computer operating systems that derive from the original AT&T Unix.',
  bash: 'Bash is a Unix shell and command language written by Brian Fox for the GNU Project as a free software replacement for the Bourne shell.',
  powershell:
    'PowerShell is a task automation and configuration management framework from Microsoft.',
  apache: 'Apache is a widely-used web server software.',
  nginx:
    'NGINX is a web server that can also be used as a reverse proxy, load balancer, mail proxy, and HTTP cache.',
  xml: 'XML (eXtensible Markup Language) is a markup language that defines rules for encoding documents in a format that is both human-readable and machine-readable.',
  json: 'JSON (JavaScript Object Notation) is a lightweight data-interchange format.',
  mongodb: 'MongoDB is a cross-platform document-oriented database program.',
  flutter:
    'Flutter is an open-source UI software development kit created by Google.',
  aws: 'Amazon Web Services (AWS) is a subsidiary of Amazon providing on-demand cloud computing platforms and APIs.',
  azure: 'Microsoft Azure is a cloud computing service created by Microsoft.',
  gcp: 'Google Cloud Platform (GCP) is a suite of cloud computing services that runs on the same infrastructure that Google uses internally for its end-user products.',
  firebase:
    'Firebase is a platform developed by Google for creating mobile and web applications.',
  graphql:
    'GraphQL is a query language for APIs and a runtime for executing those queries by using a type system you define for your data.',
  numpy:
    'NumPy is a library for the Python programming language, adding support for large, multi-dimensional arrays and matrices, along with a large collection of high-level mathematical functions to operate on these arrays.',
  pandas:
    'Pandas is a software library written for the Python programming language for data manipulation and analysis.',
  tensorflow:
    'TensorFlow is an open-source machine learning framework developed by Google.',
  keras: 'Keras is an open-source deep learning framework written in Python.',
  pytorch: 'PyTorch is an open-source machine learning library for Python.',
  scikit:
    'Scikit-learn is a free software machine learning library for the Python programming language.',
  spark:
    'Apache Spark is an open-source distributed general-purpose cluster-computing framework.',
  threading:
    'Threading is a feature usually provided by the operating system that allows multiple threads to execute concurrently.',
  'data-structures':
    'Data structures are a way of organizing and storing data so that it can be accessed and worked with efficiently.',
  algorithms:
    'Algorithms are a set of instructions for solving a problem or accomplishing a task.',
  'design-patterns':
    'Design patterns are reusable solutions to common problems in software design.',
  'object-oriented':
    'Object-oriented programming (OOP) is a programming paradigm based on the concept of "objects".',
  'functional-programming':
    'Functional programming is a programming paradigm that treats computation as the evaluation of mathematical functions and avoids changing-state and mutable data.',
  'web-development':
    'Web development is the work involved in developing a website for the Internet or an intranet.',
  'mobile-development':
    'Mobile app development is the act or process by which a mobile app is developed for mobile devices, such as personal digital assistants, enterprise digital assistants, or mobile phones.',
  algorithm:
    'Algorithm is a set of instructions for solving a problem or accomplishing a task.',
  jenkins:
    'Jenkins is an open-source automation server that helps to automate the non-human part of the software development process.',
  devops:
    'DevOps is a set of practices that combines software development (Dev) and IT operations (Ops).',
  'continuous-integration':
    'Continuous Integration (CI) is a development practice that requires developers to integrate code into a shared repository several times a day.',
  'continuous-deployment':
    'Continuous Deployment (CD) is a software release process that uses automated testing to validate if changes are correct and stable for immediate autonomous deployment to a production environment.',
  'continuous-delivery':
    'Continuous Delivery (CD) is a software engineering approach in which teams produce software in short cycles, ensuring that the software can be reliably released at any time.',
  microservices:
    'Microservices is an architectural style that structures an application as a collection of loosely coupled services.',
  rest: 'REST (Representational State Transfer) is an architectural style that defines a set of constraints to be used for creating web services.',
  performance:
    'Performance is the extent to which a system accomplishes its tasks.',
  security:
    'Security is the degree of resistance to, or protection from, harm.',
  testing:
    'Testing is the process of evaluating a system or its component(s) with the intent to find whether it satisfies the specified requirements or not.',
  'unit-testing':
    'Unit testing is a software testing method by which individual units of source code are tested to determine whether they are fit for use.',
  'integration-testing':
    'Integration testing is the phase in software testing in which individual software modules are combined and tested as a group.',
  'system-testing':
    'System testing is the testing of a complete and fully integrated software product.',
  api: 'API (Application Programming Interface) is a set of rules and protocols for building and interacting with software applications.',
  csv: 'CSV (Comma-Separated Values) is a file format used to store tabular data.',
  excel: 'Excel is a spreadsheet program developed by Microsoft.',
  class:
    'A class is a blueprint for creating objects (a particular data structure), providing initial values for state (member variables or attributes), and implementations of behavior (member functions or methods).',
  object:
    'An object is an instance of a class. Objects have states and behaviors.',
  http: 'HTTP (Hypertext Transfer Protocol) is an application layer protocol for distributed, collaborative, hypermedia information systems.',
  rds: 'Amazon RDS (Relational Database Service) is a managed relational database service provided by Amazon Web Services.',
  fargate:
    'AWS Fargate is a serverless compute engine for containers that works with both Amazon Elastic Container Service (ECS) and Amazon Elastic Kubernetes Service (EKS).',
  lambda:
    'AWS Lambda is a serverless computing service provided by Amazon Web Services.',
  cloudwatch:
    'Amazon CloudWatch is a monitoring and observability service built for DevOps engineers, developers, site reliability engineers (SREs), and IT managers.',
  cloudformation:
    'AWS CloudFormation is a service that helps you model and set up your Amazon Web Services resources.',
  sqs: 'Amazon Simple Queue Service (SQS) is a fully managed message queuing service that enables you to decouple and scale microservices, distributed systems, and serverless applications.',
  s3: 'Amazon S3 (Simple Storage Service) is an object storage service that offers industry-leading scalability, data availability, security, and performance.',
  ec2: 'Amazon Elastic Compute Cloud (EC2) is a web service that provides secure, resizable compute capacity in the cloud.',
  iam: 'AWS Identity and Access Management (IAM) is a web service that helps you securely control access to AWS resources.',
  vpc: 'Amazon Virtual Private Cloud (VPC) is a service that lets you launch AWS resources in a logically isolated virtual network that you define.',
  route53:
    'Amazon Route 53 is a scalable and highly available Domain Name System (DNS) web service.',
  dynamodb:
    'Amazon DynamoDB is a fully managed proprietary NoSQL database service that supports key-value and document data structures.',
  elasticache:
    'Amazon ElastiCache is a fully managed in-memory data store and cache service by Amazon Web Services.',
  eks: 'Amazon Elastic Kubernetes Service (EKS) is a managed Kubernetes service provided by AWS.',
  sagemaker:
    'Amazon SageMaker is a fully managed service that provides every developer and data scientist with the ability to build, train, and deploy machine learning models quickly.',
  glue: 'AWS Glue is a fully managed extract, transform, and load (ETL) service that makes it easy for customers to prepare and load their data for analytics.',
  redshift:
    'Amazon Redshift is a fully managed, petabyte-scale data warehouse service in the cloud.',
  kinesis:
    'Amazon Kinesis is a platform on AWS to collect, process, and analyze real-time, streaming data.',
  cloudfront:
    'Amazon CloudFront is a fast content delivery network (CDN) service that securely delivers data, videos, applications, and APIs to customers globally.',
  ecs: 'Amazon Elastic Container Service (ECS) is a highly scalable, high-performance container orchestration service that supports Docker containers.',
  'blob-storage':
    'Blob storage is a feature in Microsoft Azure that stores unstructured data in the cloud as objects/blobs.',
  'azure-functions':
    'Azure Functions is a serverless compute service that enables you to run event-triggered code without having to explicitly provision or manage infrastructure.',
  'azure-devops':
    'Azure DevOps is a set of services for teams to share code, track work, and ship software.',
  'azure-storage':
    'Azure Storage is a Microsoft-managed cloud service that provides storage that is highly available, secure, durable, scalable, and redundant.',
  'azure-sql':
    'Azure SQL Database is a managed cloud database provided as part of Microsoft Azure.',
  'azure-virtual-machines':
    'Azure Virtual Machines is an on-demand, scalable computing resource provided by Microsoft Azure.',
  'azure-app-service':
    'Azure App Service is a fully managed platform for building, deploying, and scaling web apps.',
  'azure-active-directory':
    'Azure Active Directory is a cloud-based identity and access management service.',
  'azure-key-vault':
    'Azure Key Vault is a cloud service for securely storing and accessing secrets.',
  'azure-cosmos-db':
    'Azure Cosmos DB is a globally distributed, multi-model database service for managing data at planet-scale.',
  elasticsearch:
    'Elasticsearch is a distributed, RESTful search and analytics engine.',
  kibana:
    'Kibana is an open-source data visualization dashboard for Elasticsearch.',
  opensearch: 'OpenSearch is a distributed search and analytics engine.',
  dynatrace:
    'Dynatrace is a software intelligence platform that monitors, optimizes, and scales your applications.',
  splunk:
    'Splunk is a software platform to search, analyze, and visualize the machine-generated data gathered from the websites, applications, sensors, devices, and so on.',
  prometheus: 'Prometheus is an open-source monitoring and alerting toolkit.',
  grafana:
    'Grafana is an open-source platform for monitoring and observability.',
  redis:
    'Redis is an open-source, in-memory data structure store used as a database, cache, and message broker.',
  kafka:
    'Apache Kafka is an open-source distributed event streaming platform used by thousands of companies for high-performance data pipelines, streaming analytics, data integration, and mission-critical applications.',
  rabbitmq:
    'RabbitMQ is an open-source message-broker software that originally implemented the Advanced Message Queuing Protocol (AMQP) and has since been extended with other protocols.',
  jira: 'Jira is a proprietary issue tracking product developed by Atlassian.',
  'github-actions': 'GitHub Actions is a CI/CD service provided by GitHub.',
  database:
    'A database is an organized collection of data, generally stored and accessed electronically from a computer system.',
  codebuild:
    'AWS CodeBuild is a fully managed continuous integration service that compiles source code, runs tests, and produces software packages that are ready to deploy.',
  db2: 'IBM Db2 is a family of data management products, including database servers, developed by IBM.',
  confluence:
    'Confluence is a team workspace where knowledge and collaboration meet.',
  bicep:
    'Bicep is a Domain Specific Language (DSL) for deploying Azure resources declaratively.',
  vpn: 'A virtual private network (VPN) extends a private network across a public network and enables users to send and receive data across shared or public networks as if their computing devices were directly connected to the private network.',
  artifactory: 'JFrog Artifactory is a universal artifact repository manager.',
  'api-gateway':
    'An API gateway is an API management tool that sits between a client and a collection of backend services.',
  'cloud-formation':
    'AWS CloudFormation is a service that helps you model and set up your Amazon Web Services resources.',
};

export class TagsUpdater {
  static initTagsUpdater = async (
    config: Config,
    scheduler: SchedulerService,
    logger: LoggerService,
    database: QetaStore,
  ): Promise<void> => {
    const schedule: SchedulerServiceTaskScheduleDefinition = config.has(
      'qeta.tagUpdater.schedule',
    )
      ? readSchedulerServiceTaskScheduleDefinitionFromConfig(
          config.getConfig('qeta.tagUpdater.schedule'),
        )
      : {
          frequency: { cron: '0 */1 * * *' },
          timeout: { hours: 1 },
          initialDelay: { minutes: 5 },
          scope: 'global',
        };

    const taskRunner = scheduler.createScheduledTaskRunner(schedule);
    await taskRunner.run({
      id: 'qeta-tag-updater',
      fn: async () => {
        await this.updateTags(logger, database);
      },
    });
  };

  static updateTags = async (logger: LoggerService, database: QetaStore) => {
    logger.info('Updating tags');
    const tagsWithoutDescription = await database.getTags({
      noDescription: true,
    });

    for (const tag of tagsWithoutDescription) {
      if (TAGS[tag.tag.toLowerCase()]) {
        await database.updateTag(tag.tag, TAGS[tag.tag]);
      }
    }
  };
}
