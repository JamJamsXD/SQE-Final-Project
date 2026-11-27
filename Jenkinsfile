
pipeline {
    agent any

    tools {
        nodejs 'NodeJS-22'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing TaskFlow dependencies...'
                sh 'npm ci'
            }
        }

        stage('Automated Tests') {
            steps {
                echo 'Running automated tests...'
                sh 'npm test'
            }
        }

        stage('Code Coverage') {
            when {
                branch 'main'
            }
            steps {
                echo 'Generating coverage report...'
                sh 'npm run test:coverage'
            }
        }

        stage('Build Application') {
            when {
                anyOf {
                    branch 'develop'
                    branch 'main'
                }
            }
            steps {
                echo 'Building TaskFlow...'
                sh 'npm run build'
            }
        }

        stage('Archive Build') {
            when {
                branch 'main'
            }
            steps {
                archiveArtifacts artifacts: 'dist/**',
                                 fingerprint: true
            }
        }
    }

    post {
        success {
            echo 'TaskFlow pipeline completed successfully!'
        }

        failure {
            echo 'TaskFlow pipeline failed. Check the console output.'
        }

        always {
            echo 'Pipeline execution finished.'
        }
    }
}
