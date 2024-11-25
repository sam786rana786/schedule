<template>
  <footer class="bg-white border-t">
    <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 class="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
          <ul class="mt-4 space-y-4">
            <li>
              <RouterLink to="/features" class="text-base text-gray-500 hover:text-gray-900">
                Features
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/solutions" class="text-base text-gray-500 hover:text-gray-900">
                Solutions
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/pricing" class="text-base text-gray-500 hover:text-gray-900">
                Pricing
              </RouterLink>
            </li>
          </ul>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
          <ul class="mt-4 space-y-4">
            <li>
              <RouterLink to="/" class="text-base text-gray-500 hover:text-gray-900">
                About
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/" class="text-base text-gray-500 hover:text-gray-900">
                Contact
              </RouterLink>
            </li>
          </ul>
        </div>
        <!-- Add more footer sections as needed -->
      </div>
      <div class="mt-8 border-t border-gray-200 pt-8">
        <p class="text-base text-gray-400">&copy; 2024 Schedule. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>