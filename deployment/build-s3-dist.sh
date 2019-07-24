echo "------------------------------------------------------------------------------"
echo "Setup the dist folder"
echo "------------------------------------------------------------------------------"
rm -r dist
mkdir dist

echo "------------------------------------------------------------------------------"
echo "Copy in the template"
echo "------------------------------------------------------------------------------"
cp *.template dist/

replace="s/%%BUCKET_NAME%%/$1/g"
sed -i '' -e $replace dist/*.template

replace="s/%%TEMPLATE_BUCKET%%/$2/g"
sed -i '' -e $replace dist/*.template

replace="s/%%VERSION%%/$3/g"
sed -i '' -e $replace dist/*.template

cd ../source

echo "------------------------------------------------------------------------------"
echo "Package the image-handler code"
echo "------------------------------------------------------------------------------"
cd image-handler
npm install
npm run build
cp dist/image-handler.zip ../../deployment/dist/image-handler.zip
