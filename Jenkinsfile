pipeline {
    agent { label 'frontend' }

    options {
        buildDiscarder(logRotator(numToKeepStr: '3'))
        disableConcurrentBuilds()
        timestamps()
    }

    environment {
        SERVICE_NAME = 'frontend'
    }

    stages {
        stage('Initialize') {
            steps {
                echo "Starting build for ${env.SERVICE_NAME}..."
                sh 'node --version'
                sh 'npm --version'
                sh 'ng version'
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    def lockHash = sh(script: 'sha256sum package-lock.json | cut -d" " -f1', returnStdout: true).trim()
                    def cacheDir = "/home/john/jenkins-agent/npm-cache/${lockHash}"

                    if (fileExists("${cacheDir}/node_modules")) {
                        echo "Cache hit — restoring node_modules from cache..."
                        sh "ln -s ${cacheDir}/node_modules node_modules"
                    } else {
                        echo "Cache miss — running npm ci..."
                        sh 'npm ci'
                        sh "mkdir -p ${cacheDir} && mv node_modules ${cacheDir}/"
                        sh "ln -s ${cacheDir}/node_modules node_modules"
                    }
                }
            }
        }

        stage('Test') {
            steps {
                echo "Running Vitest tests for ${env.SERVICE_NAME}..."
                // --watch=false exits after a single test run (required for CI)
                // --reporter=junit outputs JUnit XML via Vitest's built-in reporter
                sh 'ng test --watch=false --reporter=junit --outputFile=test-results/results.xml'
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'test-results/*.xml'
                }
            }
        }

        stage('Build') {
            steps {
                echo "Building ${env.SERVICE_NAME} for production..."
                sh 'ng build --configuration production'
            }
        }

        stage('Deploy') {
            steps {
                echo "Deploying ${env.SERVICE_NAME} to Vercel..."
                withCredentials([string(credentialsId: 'vercel-token', variable: 'VERCEL_TOKEN')]) {
                    // --prod targets the production environment
                    // --yes skips all interactive prompts (required for CI)
                    sh 'npx vercel --prod --token=$VERCEL_TOKEN --yes'
                }
            }
            post {
                failure {
                    echo "Deployment failed. Rolling back to previous Vercel deployment..."
                    withCredentials([string(credentialsId: 'vercel-token', variable: 'VERCEL_TOKEN')]) {
                        sh 'npx vercel rollback --token=$VERCEL_TOKEN --yes'
                    }
                }
            }
        }
    }

    post {
        success {
        	  echo "SUCCESS: ${env.SERVICE_NAME} build and tests passed. Alert sent to email."
            emailext(
                subject: "[Jenkins] ${env.JOB_NAME} #${env.BUILD_NUMBER} — Build Successful",
                body: """
                    <p><b>Status:</b> SUCCESS</p>
                    <p><b>Service:</b> ${env.SERVICE_NAME}</p>
                    <p><b>Job:</b> ${env.JOB_NAME}</p>
                    <p><b>Build:</b> #${env.BUILD_NUMBER}</p>
                    <p><b>Console Output:</b> <a href="${env.BUILD_URL}console">${env.BUILD_URL}console</a></p>
                """,
                mimeType: 'text/html',
                to: 'johneliud2001@gmail.com'
            )
        }
        failure {
        	  echo "FAILURE: ${env.SERVICE_NAME} build or tests failed. Alert sent to email. Check logs and test reports."
            emailext(
                subject: "[Jenkins] ${env.JOB_NAME} #${env.BUILD_NUMBER} — Build Failed",
                body: """
                    <p><b>Status:</b> FAILURE</p>
                    <p><b>Service:</b> ${env.SERVICE_NAME}</p>
                    <p><b>Job:</b> ${env.JOB_NAME}</p>
                    <p><b>Build:</b> #${env.BUILD_NUMBER}</p>
                    <p><b>Console Output:</b> <a href="${env.BUILD_URL}console">${env.BUILD_URL}console</a></p>
                """,
                mimeType: 'text/html',
                to: 'johneliud2001@gmail.com'
            )
        }
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
        }
    }
}
