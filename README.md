# EvanDockers

```
aws ecr get-login-password | docker login --username AWS --password-stdin 984648741180.dkr.ecr.us-east-1.amazonaws.com

Now that you have an image to push to Amazon ECR Public, you can create a public repository. In this example, you create a public repository called ecr-tutorial to which you later push the hello-world:latest image. All public repositories that contain an image are publicly visible in the Amazon ECR Public Gallery so we will specify some catalog data for the repository.

docker tag node2:latest 984648741180.dkr.ecr.us-east-1.amazonaws.com/node2:latest

docker push 984648741180.dkr.ecr.us-east-1.amazonaws.com/node2:latest

aws ecr delete-repository --repository-name node2 --region us-east-1 --force
```
```
docker run -dp 3001:3000 `
     -w /app -v "$(pwd):/app" `
     node:12-alpine `
     sh -c "yarn install && yarn run dev"



docker run -d `
     --network todo-app --network-alias mysql `
     -v todo-mysql-data:/var/lib/mysql `
     -e MYSQL_ROOT_PASSWORD=secret `
     -e MYSQL_DATABASE=todos `
     mysql:5.7



     docker run -dp 3000:3000 `
   -w /app -v "$(pwd):/app" `
   --network todo-app `
   -e MYSQL_HOST=mysql `
   -e MYSQL_USER=root `
   -e MYSQL_PASSWORD=secret `
   -e MYSQL_DB=todos `
   node:12-alpine `
   sh -c "yarn install && yarn run dev"
   
   
   
   //new
```
git config --global user.email "dangolevan@gmail.com"
  git config --global user.name "edangolgithub"