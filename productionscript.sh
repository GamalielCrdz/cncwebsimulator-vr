react-scripts build
cd public 
cp -r . ..
cd ..
git checkout gh-pages
rm -rf src
rm -rf public
git add .
git commit -sm "release"
git push origin gh-pages