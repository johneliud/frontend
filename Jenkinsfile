pipeline {
    agent { label 'frontend' }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
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
                echo 'Installing npm dependencies...'
                // npm ci ensures a clean, reproducible install from package-lock.json
                sh 'npm ci'
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
        }
    }

    post {
        success {
            echo "SUCCESS: ${env.SERVICE_NAME} build and tests passed."
        }
        failure {
            echo "FAILURE: ${env.SERVICE_NAME} build or tests failed. Check logs and test reports."
        }
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
        }
    }
}
