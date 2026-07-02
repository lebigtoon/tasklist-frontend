pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'nutnak/tasklist-frontend-certif'
        DOCKER_TAG   = "${BUILD_NUMBER}"
    }

    tools {
        nodejs 'NodeJS'
    }

    triggers {
        pollSCM('H/2 * * * *')
    }

    stages {

        stage('Install') {
            steps {
                sh 'npm install'
            }
        }

        stage('Unit Tests') {
            steps {
                sh 'npm run test:coverage'
            }
            post {
                always {
                    sh 'cp reports/junit.xml reports/junit-unit.xml || true'
                    junit allowEmptyResults: true, testResults: 'reports/junit-unit.xml'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv(credentialsId: 'nutnak-sonar-token-V2', installationName: 'SonarQube') {
                    sh 'npx sonarqube-scanner'
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh """
                    docker build \
                        --tag ${DOCKER_IMAGE}:${DOCKER_TAG} \
                        --tag ${DOCKER_IMAGE}:latest \
                        .
                """
            }
        }

        stage('Trivy Scan') {
            steps {
                sh """
                    trivy image \
                        --severity HIGH,CRITICAL \
                        --exit-code 1 \
                        --format table \
                        --output trivy-report.txt \
                        ${DOCKER_IMAGE}:${DOCKER_TAG}
                """
            }
            post {
                always {
                    archiveArtifacts artifacts: 'trivy-report.txt', allowEmptyArchive: true
                }
            }
        }

        stage('Generate SBOM') {
            steps {
                sh """
                    trivy image \
                        --format cyclonedx \
                        --output sbom-cyclonedx.json \
                        ${DOCKER_IMAGE}:${DOCKER_TAG}
                """
            }
            post {
                always {
                    archiveArtifacts artifacts: 'sbom-cyclonedx.json', allowEmptyArchive: true
                }
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'nutnak-dockerhub-password',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        echo "\$DOCKER_PASS" | docker login -u "\$DOCKER_USER" --password-stdin
                        docker push ${DOCKER_IMAGE}:${DOCKER_TAG}
                        docker push ${DOCKER_IMAGE}:latest
                    """
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
