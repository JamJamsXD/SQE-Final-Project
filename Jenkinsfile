
pipeline {
    agent any

    tools {
        nodejs 'NodeJS-24'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
    }

    environment {
        SONAR_SERVER       = 'TaskFlow-Sonar'
        SONAR_SCANNER_TOOL = 'SonarScanner'
        SONAR_URL          = 'http://sonarqube:9000'
        ARTIFACT_NAME      = "taskflow-${env.BUILD_NUMBER}.tar.gz"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "Branch: ${env.BRANCH_NAME} | CI build: #${env.BUILD_NUMBER}"
            }
        }

        stage('Install and Test') {
            steps {
                sh 'node -v && npm -v'
                sh 'npm ci'
                sh 'npm test'
            }
        }

        stage('Coverage') {
            steps {
                sh 'npm run test:coverage'
            }
        }

        stage('Dependency Audit') {
            steps {
                sh 'npm audit | tee audit-report.txt || true'
            }
        }

        stage('SonarQube Analysis') {
            when {
                anyOf {
                    branch 'main'
                    branch 'demo/sonarqube-failure'
                }
            }
            steps {
                script {
                    def scannerHome = tool env.SONAR_SCANNER_TOOL
                    // withSonarQubeEnv supplies the token; -Dsonar.host.url overrides the server URL.
                    withSonarQubeEnv(env.SONAR_SERVER) {
                        sh "${scannerHome}/bin/sonar-scanner -Dsonar.host.url=${env.SONAR_URL}"
                    }
                }
            }
        }

        stage('Quality Gate') {
            when {
                anyOf {
                    branch 'main'
                    branch 'demo/sonarqube-failure'
                }
            }
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build') {
            when {
                anyOf {
                    branch 'develop'
                    branch 'main'
                    branch 'demo/sonarqube-failure'
                }
            }
            steps {
                sh 'npm run build'
            }
        }

        stage('Archive Artifact') {
            when {
                anyOf {
                    branch 'main'
                    branch 'demo/sonarqube-failure'
                }
            }
            steps {
                sh '''
                    rm -f taskflow-*.tar.gz

                    tar -czf "$ARTIFACT_NAME" dist Dockerfile

                    echo "Artifact contents:"
                    tar -tzf "$ARTIFACT_NAME"

                    if tar -tzf "$ARTIFACT_NAME" | grep -q node_modules; then
                        echo "ERROR: node_modules found in artifact"
                        exit 1
                    fi
                '''

                archiveArtifacts artifacts: "${env.ARTIFACT_NAME}, audit-report.txt",
                                 fingerprint: true
            }
        }
    }

    post {
        success {
            echo "Pipeline for ${env.BRANCH_NAME} completed successfully."
        }

        failure {
            echo "Pipeline for ${env.BRANCH_NAME} failed. Check the stage that turned red."
        }
    }
}
