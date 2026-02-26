const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const CSV_PATH = '../wc-product-export-26-2-2026-1772097585820.csv';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const parseCsv = () => {
    return new Promise((resolve, reject) => {
        const rows = [];
        fs.createReadStream(CSV_PATH)
            .pipe(csv())
            .on('data', (data) => rows.push(data))
            .on('end', () => resolve(rows))
            .on('error', (error) => reject(error));
    });
};

const importData = async () => {
    await connectDB();

    try {
        console.log('Parsing CSV...');
        const data = await parseCsv();
        console.log(`Loaded ${data.length} rows.`);

        // Separate simple, variable, and variation
        const simpleRows = data.filter(r => r.Type === 'simple');
        const variableRows = data.filter(r => r.Type === 'variable');
        const variationRows = data.filter(r => r.Type === 'variation');

        // Extract categories
        const categoryNames = new Set();
        data.forEach(r => {
            if (r.Categories) {
                r.Categories.split(',').forEach(c => categoryNames.add(c.trim()));
            }
        });

        const categoryMap = {};
        for (const catName of categoryNames) {
            if (!catName) continue;
            let category = await Category.findOne({ name: catName, type: 'category' });
            if (!category) {
                category = await Category.create({ name: catName, type: 'category' });
                console.log(`Created category: ${catName}`);
            }
            categoryMap[catName] = category._id;
        }

        // Process variations (group by parent ID)
        const variantsByParent = {};
        variationRows.forEach(v => {
            const parentId = v.Parent ? v.Parent.replace('id:', '') : '';
            if (!parentId) return;

            if (!variantsByParent[parentId]) variantsByParent[parentId] = [];

            let price = parseFloat(v['Regular price']) || 0;
            let salePrice = parseFloat(v['Sale price']);
            let finalPrice = salePrice || price;

            // Extract image
            const images = v.Images ? v.Images.split(',').map(img => img.trim()).filter(Boolean) : [];
            const image = images.length > 0 ? images[0] : '';

            variantsByParent[parentId].push({
                value: v['Attribute 1 value(s)'],
                price: finalPrice,
                image: image
            });
        });

        // Function to create products
        const processProducts = async (rows, hasVariantsFlag) => {
            for (const r of rows) {
                let catList = r.Categories ? r.Categories.split(',').map(c => c.trim()).filter(Boolean) : [];
                let categoryId = catList.length > 0 && categoryMap[catList[0]] ? categoryMap[catList[0]] : null;

                if (!categoryId) {
                    // Get a default category if missing
                    const defaultCat = Object.values(categoryMap)[0];
                    categoryId = defaultCat;
                }

                const price = parseFloat(r['Regular price']) || 0;
                const salePrice = parseFloat(r['Sale price']);
                let finalPrice = salePrice || price;
                let comparePrice = salePrice ? price : 0;

                const images = r.Images ? r.Images.split(',').map(img => img.trim()).filter(Boolean) : [];

                let variantType = 'None';
                let hasVariants = hasVariantsFlag;
                let productVariants = [];

                if (hasVariantsFlag) {
                    const id = r.ID;
                    if (variantsByParent[id]) {
                        productVariants = variantsByParent[id];
                        let attrName = r['Attribute 1 name'] || '';
                        if (attrName.toLowerCase() === 'size') variantType = 'Size';
                        else if (attrName.toLowerCase() === 'frame') variantType = 'Frame';
                        else variantType = 'Size'; // Default to Size if unnamed

                        // Set base price from first variant if parent price is 0
                        if (finalPrice === 0 && productVariants.length > 0) {
                            finalPrice = productVariants[0].price;
                        }
                    }
                }

                // Add Product
                const productOptions = {
                    name: r.Name,
                    description: r.Description || r.Name,
                    shortDescription: r['Short description'] || '',
                    price: finalPrice,
                    comparePrice: comparePrice,
                    category: categoryId,
                    images: images,
                    stock: parseInt(r.Stock) || 0,
                    ...(r.SKU ? { sku: r.SKU } : {}),
                    hasVariants: hasVariants,
                    variantType: variantType,
                    variants: productVariants,
                    isActive: r.Published === '1',
                    isFeatured: r['Is featured?'] === '1'
                };

                await Product.create(productOptions);
                console.log(`Created product: ${r.Name}`);
            }
        };

        // Process variable
        console.log('Clearing existing products...');
        await Product.deleteMany();

        console.log('Processing simple products...');
        await processProducts(simpleRows, false);

        console.log('Processing variable products...');
        await processProducts(variableRows, true);

        console.log('Import completed successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error importing data: ${error.message}`);
        process.exit(1);
    }
};

importData();
