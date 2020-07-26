const inquirer = require('inquirer');
const fs = require('fs');
const generateMarkdown = require('./utils/generateMarkdown');
const { listenerCount } = require('process');

let stepNumber = 0;

// array of questions for user
const questions = [
    [ //initial questions
        {
            type: 'input',
            name: 'title',
            message: 'Enter the name of your project:'
        },
        {
            type: 'input',
            name: 'description',
            message: 'Provide a detailed description of the project:'
        },
        //usage
        {
            type: 'input',
            name: 'usageInstructions',
            message: 'Provide usage instructions for the project:'
        },
        {
            type: 'confirm',
            name: 'confirmScreenshot',
            message: 'Would you like to add a screenshot?',
            default: false
        },
        {
            type: 'input',
            name: 'screenshotUrl',
            message: 'provide a URL for your screenshot',
            when: ({ confirmScreenshot }) => confirmScreenshot
        },
        //license 
        {
            type: 'confirm',
            name: 'confirmLicense',
            message: 'Would you like to add a license?',
            default: true
        },
        {
            type: 'list',
            name: 'licenseType',
            message: 'Choose a license type:',
            choices: ['Apache License 2.0', 'GNU GPLv3', 'GNU GPLv2', 'ISC', 'MIT'],
            when: ({ confirmLicense }) => confirmLicense
        }
    ],
    [ //installation steps
        {
            type: 'input',
            name: 'installStep',
            message: `Provide installation info for this step:`
        },
        {
            type: 'confirm',
            name: 'confirmScreenshot',
            message: 'Would you like to add a screenshot?',
            default: false
        },
        {
            type: 'input',
            name: 'screenshotUrl',
            message: 'provide a URL for your screenshot',
            when: ({ confirmScreenshot }) => confirmScreenshot
        },
        {
            type: 'confirm',
            name: 'confirmAddStep',
            message: 'Would you like to add another step?',
            default: false
        }
    ],
    [ //contributors
        {
            type: 'input',
            name: 'contributor',
            message: 'Contributor\'s Name:'
        },
        {
            type: 'input',
            name: 'role',
            message: 'Contributor\'s Role:'
        },
        {
            type: 'confirm',
            name: 'confirmAddContributor',
            message: 'Would you like to add another Contributor?',
            default: false
        }
    ]
];

const [initialQuestions, installSteps, contributorQuestions] = questions;

const promptInitialQuestions = () => inquirer.prompt(initialQuestions);

const promptInstallSteps = function(projectData) {
    if (!projectData.installation) {
        projectData.installation = [];
    }
    
    stepNumber++

    console.log(`
    =========================
    Installation Info: Step ${stepNumber}
    =========================
    `);

    return inquirer.prompt(installSteps)
    .then(stepData => {
        projectData.installation.push(stepData);
        if (stepData.confirmAddStep) {
            return promptInstallSteps(projectData);
        } else {
            console.log(`
            =================
            Add Contributors!
            =================
            `);
            return projectData;
        }
    }) 
};

const promptContributors = function(projectData) {
    if (!projectData.contributors) {
        projectData.contributors = [];
    }

    return inquirer.prompt(contributorQuestions)
    .then(contributorData => {
        projectData.contributors.push(contributorData);
        if (contributorData.confirmAddContributor) {
            return promptContributors(projectData);
        } else {
            return projectData;
        }
    })  
};

// function to write README file
function writeToFile(data) {
    const pageHTML = generateMarkdown(data);
    
    fs.writeFile('./target/README.md', pageHTML, err => {
       if (err) throw new Error(err);

       console.log('File created in "target" folder');
     });

} 

// function to initialize program
function init() {
    promptInitialQuestions()
    .then(promptInstallSteps)
    .then(promptContributors)
    .then(writeToFile)
};

// function call to initialize program
init();
