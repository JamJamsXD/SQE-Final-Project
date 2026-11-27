// CI pipeline for the Jenkins Multibranch Pipeline.
//
//  Stage               feature/*   develop   main
//  Checkout               yes        yes      yes
//  Install and Test       yes        yes      yes
//  Coverage               yes        yes      yes
//  SonarQube Analysis                         yes
//  Quality Gate                               yes
//  Build                             yes      yes
//  Archive Artifact                           yes

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

    environment {
        // Must match the names configured in Manage Jenkins.
        SONAR_SERVER       = 'SonarQube'      // Manage Jenkins > System > SonarQube servers
        SONAR_SCANNER_TOOL = 'SonarScanner'   // Manage Jenkins > Tools > SonarQube Scanner
        // Address of SonarQube as seen FROM the Jenkins container (same Docker network).
        // Passed to the scanner explicitly, so a wrong URL in the Jenkins server entry cannot break it.
        SONAR_URL          = 'http://sonarqube:9000'
        ARTIFACT_NAME      = "taskflow-${env.BUILD_NUMBER}.tar.gz"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "Branch: ${env.BRANCH_NAME}  |  CI build: #${env.BUILD_NUMBER}"
            }
        }

        stage('Install and Test') {
            steps {
                sh 'node -v && npm -v'
                sh 'npm ci'
                // A failing test fails this stage and stops the pipeline.
                sh 'npm test'
            }
        }

        stage('Coverage') {
            steps {
                // Writes coverage/lcov.info; also fails below the 80% threshold.
                sh 'npm run test:coverage'
            }
        }

        stage('Dependency Audit') {
            steps {
                // Informational only: findings are reported, not blocking.
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
                    def scannerHome = tool 'SonarScanner'
                    withSonarQubeEnv('TaskFlow-Sonar') {
                        sh "${scannerHome}/bin/sonar-scanner"
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
                }
            }
            steps {
                sh 'npm run build'
            }
        }

        stage('Archive Artifact') {
            when { branch 'main' }
            steps {
                // Production build output + Dockerfile only. No node_modules.
                sh '''
                    rm -f taskflow-*.tar.gz
                    tar -czf "$ARTIFACT_NAME" dist Dockerfile
                    echo "Artifact contents:"
                    tar -tzf "$ARTIFACT_NAME"
                    if tar -tzf "$ARTIFACT_NAME" | grep -q node_modules; then
                        echo "ERROR: node_modules found in artifact"; exit 1
                    fi
                '''
                archiveArtifacts artifacts: "${env.ARTIFACT_NAME}, audit-report.txt",
                                 fingerprint: true
            }
        }
    }

    post {
        success { echo "Pipeline for ${env.BRANCH_NAME} completed successfully." }
        failure { echo "Pipeline for ${env.BRANCH_NAME} failed. Check the stage that turned red." }
    }
}
