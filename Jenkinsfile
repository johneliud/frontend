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
                echo "Running Jasmine/Karma tests for ${env.SERVICE_NAME}..."
                // --watch=false exits after a single test run (required for CI)
                // --browsers=ChromeHeadless runs without a display (required for headless agents)
                sh 'ng test --watch=false --browsers=ChromeHeadless'
            }
            post {
                always {
                    // Requires karma-junit-reporter configured in karma.conf.js
                    // outputDir: 'test-results', outputFile: 'results.xml'
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
