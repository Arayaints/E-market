<template>
  <div>
    <AppHeader />

    <div class="content-body">


      <!-- Loading State -->
      <div v-if="loading" style="text-align: center; padding: 60px;">
        <div style="font-size: 1rem; color: #64748b; display: inline-flex; align-items: center; gap: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>กำลังโหลดข้อมูลสัญญา...</span>
        </div>
      </div>

      <!-- Standard Table Card Container (Mockup Standard) -->
      <div v-else class="table-card-container">
        <!-- Card Header: Title + Subtitle on Left, Export + Actions + Search on Right -->
        <div class="table-card-header">
          <div class="table-header-left">
            <h2 class="table-card-title">รายการสัญญาเช่าทั้งหมด</h2>
            <div class="table-card-subtitle">{{ filteredContracts.length }} รายการ</div>
          </div>

          <div class="table-header-actions">
            <!-- Outlined Export Report Button -->
            <button class="btn-export-report" @click="exportReport" title="ส่งออกรายงาน">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
              <span>ออกรายงาน</span>
            </button>

            <!-- Primary Action Button -->
            <button class="btn-table-primary-action" @click="openCreateModal">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span>สร้างสัญญาใหม่</span>
            </button>

            <!-- Search Box with Search Icon Left & Funnel Filter Icon Right -->
            <div class="table-search-funnel-box">
              <span class="search-icon-left">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="ค้นหาเลขที่สัญญา, ผู้เช่า..."
                @input="filterContracts(); currentPage = 1"
              />
              <span class="filter-icon-right" title="ตัวกรอง">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              </span>
            </div>
          </div>
        </div>

        <!-- Filter Tabs (ทั้งหมด, ใช้งานอยู่, รอดำเนินการ, หมดสัญญา, ยกเลิกแล้ว) -->
        <div class="table-nav-tabs">
          <button
            class="table-nav-tab"
            :class="{ active: selectedStatus === '' }"
            @click="selectedStatus = ''; filterContracts(); currentPage = 1"
          >
            ทั้งหมด ({{ contracts.length }})
          </button>
          <button
            class="table-nav-tab"
            :class="{ active: selectedStatus === 'active' }"
            @click="selectedStatus = 'active'; filterContracts(); currentPage = 1"
          >
            ใช้งานอยู่ ({{ countContractsByStatus('active') }})
          </button>
          <button
            class="table-nav-tab"
            :class="{ active: selectedStatus === 'pending' }"
            @click="selectedStatus = 'pending'; filterContracts(); currentPage = 1"
          >
            รอดำเนินการ ({{ countContractsByStatus('pending') }})
          </button>
          <button
            class="table-nav-tab"
            :class="{ active: selectedStatus === 'expired' }"
            @click="selectedStatus = 'expired'; filterContracts(); currentPage = 1"
          >
            หมดสัญญา ({{ countContractsByStatus('expired') }})
          </button>
          <button
            class="table-nav-tab"
            :class="{ active: selectedStatus === 'terminated' }"
            @click="selectedStatus = 'terminated'; filterContracts(); currentPage = 1"
          >
            ยกเลิกแล้ว ({{ countContractsByStatus('terminated') }})
          </button>
        </div>

        <!-- Contracts Table -->
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th style="width: 140px;">เลขที่สัญญา</th>
                <th style="width: 130px;">แผงเช่า</th>
                <th>ชื่อร้านค้า / สินค้า</th>
                <th>ผู้เช่า (Tenant)</th>
                <th style="width: 150px;">ระยะเวลาสัญญา</th>
                <th style="width: 120px;">ค่าเช่า/เดือน</th>
                <th style="width: 110px;">เงินประกัน</th>
                <th style="width: 120px;">สถานะ</th>
                <th style="text-align: right; width: 140px;">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in paginatedContracts" :key="c.id">
                <td>
                  <strong class="table-code-blue" @click="viewContractDoc(c)">{{ c.contract_number }}</strong>
                  <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 2px;">รอบ: {{ c.billing_cycle === 'monthly' ? 'รายเดือน' : 'รายวัน' }}</div>
                </td>
                <td>
                  <span class="badge badge-occupied" v-if="c.stall">
                    {{ c.stall.stall_number }} ({{ c.stall.zone_code }})
                  </span>
                </td>
                <td>
                  <div style="font-weight: 600; color: #1e293b;">{{ c.business_name }}</div>
                  <div style="font-size: 0.78rem; color: #94a3b8;">{{ c.business_type || 'ทั่วไป' }}</div>
                </td>
                <td>
                  <div style="font-weight: 600; color: #1e293b;">{{ c.tenant_name }}</div>
                  <div style="font-size: 0.78rem; color: #64748b;">{{ c.tenant_phone }}</div>
                </td>
                <td>
                  <div style="color: #475569;">{{ c.start_date }} ถึง {{ c.end_date }}</div>
                  <div v-if="isExpiringSoon(c.end_date) && c.status === 'active'" style="font-size: 0.75rem; color: #fb7185; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; margin-top: 2px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    <span>ใกล้หมดอายุ</span>
                  </div>
                </td>
                <td><strong class="cell-bold-amount">฿{{ Number(c.rental_fee).toLocaleString() }}</strong></td>
                <td>฿{{ Number(c.security_deposit || 0).toLocaleString() }}</td>
                <td>
                  <span class="status-pill-badge" :class="getStatusBadgeClass(c.status)">
                    {{ getStatusLabel(c.status) }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div style="display: inline-flex; align-items: center; justify-content: flex-end; gap: 6px;">
                    <button class="btn-table-action btn-table-view" title="ดูเอกสารสัญญาฉบับเต็ม" @click="viewContractDoc(c)">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                      <span>สัญญา</span>
                    </button>
                    <button
                      v-if="c.status === 'active'"
                      class="btn-table-action btn-table-cancel"
                      title="สิ้นสุด/ยกเลิกสัญญา"
                      @click="terminateContract(c)"
                    >
                      <span>สิ้นสุด</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredContracts.length === 0">
                <td colspan="9" style="text-align: center; color: #94a3b8; padding: 48px;">
                  ไม่พบรายการสัญญาเช่าที่ค้นหา
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Standard Table Pagination Footer (Mockup Standard) -->
        <div v-if="filteredContracts.length > 0" class="table-pagination-bar">
          <div class="table-page-jump">
            <span>หน้า</span>
            <select v-model="currentPage" class="table-page-select">
              <option v-for="p in totalPages" :key="p" :value="p">{{ p }}</option>
            </select>
            <span>จาก {{ totalPages || 1 }}</span>
          </div>

          <div class="table-page-nav">
            <button class="table-page-btn" :disabled="currentPage === 1" @click="currentPage = 1">«</button>
            <button class="table-page-btn" :disabled="currentPage === 1" @click="currentPage--">‹</button>
            <button
              v-for="p in visiblePages"
              :key="p"
              class="table-page-btn"
              :class="{ active: currentPage === p }"
              @click="currentPage = p"
            >
              {{ p }}
            </button>
            <button class="table-page-btn" :disabled="currentPage === totalPages || totalPages === 0" @click="currentPage++">›</button>
            <button class="table-page-btn" :disabled="currentPage === totalPages || totalPages === 0" @click="currentPage = totalPages">»</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Create Contract -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal-content" style="max-width: 720px;">
        <div class="modal-header">
          <h3 style="font-size: 1.2rem; display: flex; align-items: center; gap: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            <span>สร้างสัญญาเช่าพื้นที่ใหม่ (New Rental Contract)</span>
          </h3>
          <button class="btn-logout" @click="showCreateModal = false" aria-label="ปิด">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form @submit.prevent="submitContract">
          <div class="modal-body">
            <h4 style="font-size: 0.95rem; margin-bottom: 12px; color: var(--primary);">1. ข้อมูลแผงเช่าและร้านค้า</h4>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="c_stall_id">เลือกแผงเช่าที่ต้องการเช่า *</label>
                <select id="c_stall_id" v-model="formContract.stall_id" required class="form-select" @change="onStallSelected">
                  <option value="" disabled>-- เลือกแผงเช่าที่ว่าง --</option>
                  <option v-for="s in availableStalls" :key="s.id" :value="s.id">
                    แผง {{ s.stall_number }} (โซน {{ s.zone?.name || s.zone_id }}) - ฿{{ Number(s.monthly_rate).toLocaleString() }}/ด.
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="c_business_name">ชื่อร้านค้า (Shop/Business Name) *</label>
                <input id="c_business_name" v-model="formContract.business_name" type="text" required placeholder="เช่น ส้มตำรสเด็ด" class="form-input" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="c_business_type">ประเภทสินค้าที่จำหน่าย</label>
              <input id="c_business_type" v-model="formContract.business_type" type="text" placeholder="เช่น อาหารปรุงสุก, เครื่องดื่ม, เสื้อผ้า" class="form-input" />
            </div>

            <h4 style="font-size: 0.95rem; margin: 20px 0 12px; color: var(--primary);">2. ข้อมูลผู้เช่า (Tenant Information)</h4>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="c_tenant_name">ชื่อ-นามสกุล ผู้เช่า *</label>
                <input id="c_tenant_name" v-model="formContract.tenant_name" type="text" required placeholder="นาย/นาง/น.ส. ..." class="form-input" />
              </div>

              <div class="form-group">
                <label class="form-label" for="c_tenant_id_card">เลขประจำตัวประชาชน / Tax ID *</label>
                <input id="c_tenant_id_card" v-model="formContract.tenant_id_card" type="text" required placeholder="13 หลัก" class="form-input" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="c_tenant_phone">เบอร์โทรศัพท์ติดต่อ *</label>
                <input id="c_tenant_phone" v-model="formContract.tenant_phone" type="text" required placeholder="08x-xxx-xxxx" class="form-input" />
              </div>

              <div class="form-group">
                <label class="form-label" for="c_tenant_email">อีเมล (ถ้ามี)</label>
                <input id="c_tenant_email" v-model="formContract.tenant_email" type="email" placeholder="tenant@example.com" class="form-input" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="c_tenant_address">ที่อยู่ตามบัตรประชาชน / ที่อยู่ติดต่อ</label>
              <textarea id="c_tenant_address" v-model="formContract.tenant_address" rows="2" class="form-textarea" placeholder="บ้านเลขที่ หมู่ ซอย ถนน ตำบล อำเภอ จังหวัด"></textarea>
            </div>

            <h4 style="font-size: 0.95rem; margin: 20px 0 12px; color: var(--primary);">3. เงื่อนไขและอัตราค่าเช่า (Lease Terms)</h4>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="c_start_date">วันที่เริ่มต้นสัญญา *</label>
                <input id="c_start_date" v-model="formContract.start_date" type="date" required class="form-input" />
              </div>

              <div class="form-group">
                <label class="form-label" for="c_end_date">วันที่สิ้นสุดสัญญา *</label>
                <input id="c_end_date" v-model="formContract.end_date" type="date" required class="form-input" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="c_billing_cycle">รอบการชำระเงิน</label>
                <select id="c_billing_cycle" v-model="formContract.billing_cycle" class="form-select">
                  <option value="monthly">รายเดือน (Monthly)</option>
                  <option value="daily">รายวัน (Daily)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="c_rental_fee">ค่าเช่าต่องวด (บาท) *</label>
                <input id="c_rental_fee" v-model.number="formContract.rental_fee" type="number" required class="form-input" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="c_security_deposit">เงินประกันความเสียหาย (บาท)</label>
                <input id="c_security_deposit" v-model.number="formContract.security_deposit" type="number" class="form-input" />
              </div>

              <div class="form-group">
                <label class="form-label" for="c_advance_payment">เงินจ่ายล่วงหน้า (บาท)</label>
                <input id="c_advance_payment" v-model.number="formContract.advance_payment" type="number" class="form-input" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="c_terms">ข้อกำหนดพิเศษ / เงื่อนไขสัญญา</label>
              <textarea id="c_terms" v-model="formContract.terms_and_conditions" rows="2" class="form-textarea" placeholder="เช่น ห้ามโอนสิทธิ์ให้บุคคลอื่น, ห้ามดัดแปลงโครงสร้าง"></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showCreateModal = false">ยกเลิก</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving">กำลังสร้างสัญญา...</span>
              <span v-else>ยืนยันและเปิดใช้งานสัญญา</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: View Contract Document (Print-ready) -->
    <div v-if="viewDocModal && currentDoc" class="modal-overlay" @click.self="viewDocModal = false">
      <div class="modal-content" style="max-width: 800px; background: #fff;">
        <div class="modal-header" style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #0f172a;">
          <h3 style="font-size: 1.15rem;">เอกสารสัญญาเช่าพื้นที่แผงค้า (เลขที่ {{ currentDoc.contract_number }})</h3>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-sm btn-primary" style="display: inline-flex; align-items: center; gap: 6px;" @click="printDoc">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              <span>พิมพ์เอกสาร</span>
            </button>
            <button class="btn btn-sm btn-secondary" @click="viewDocModal = false">ปิด</button>
          </div>
        </div>

        <div class="modal-body" id="print-area">
          <div class="contract-document">
            <div class="contract-header">
              <h2 style="font-size: 1.4rem; font-weight: 700;">หนังสือสัญญาเช่าพื้นที่แผงค้าในตลาด</h2>
              <div style="font-size: 0.9rem; color: #475569; margin-top: 4px;">ระบบจัดการตลาด e-Market Management System</div>
              <div style="font-size: 0.85rem; font-weight: 600; color: #059669; margin-top: 6px;">
                เลขที่สัญญา: {{ currentDoc.contract_number }}
              </div>
            </div>

            <div style="line-height: 1.8; font-size: 0.92rem; text-align: justify;">
              <p>
                สัญญาฉบับนี้ทำขึ้น ณ <strong>ตลาดกลางชุมชน e-Market</strong> เมื่อวันที่ <strong>{{ currentDoc.created_at ? currentDoc.created_at.slice(0, 10) : currentDoc.start_date }}</strong>
                ระหว่าง <strong>บริษัท บริหารจัดการตลาด จำกัด</strong> (ซึ่งต่อไปนี้เรียกว่า "ผู้ให้เช่า") ฝ่ายหนึ่ง กับ
              </p>

              <div class="contract-grid" style="margin-top: 14px; background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <div><strong>ชื่อผู้เช่า:</strong> {{ currentDoc.tenant_name }}</div>
                <div><strong>เลขประจำตัวประชาชน:</strong> {{ currentDoc.tenant_id_card }}</div>
                <div><strong>เบอร์โทรศัพท์:</strong> {{ currentDoc.tenant_phone }}</div>
                <div><strong>อีเมล:</strong> {{ currentDoc.tenant_email || '-' }}</div>
                <div style="grid-column: 1 / -1;"><strong>ที่อยู่:</strong> {{ currentDoc.tenant_address || '-' }}</div>
              </div>

              <div class="section-title">ข้อ ๑. วัตถุประสงค์และสถานที่เช่า</div>
              <p>
                ผู้ให้เช่าตกลงให้เช่า และผู้เช่าตกลงเช่าพื้นที่แผงค้าเลขที่ <strong>{{ currentDoc.stall ? currentDoc.stall.stall_number : currentDoc.stall_id }}</strong> 
                เพื่อประกอบกิจการร้านค้า <strong>"{{ currentDoc.business_name }}"</strong> จำหน่ายสินค้าประเภท <strong>{{ currentDoc.business_type || 'ทั่วไป' }}</strong>
              </p>

              <div class="section-title">ข้อ ๒. ระยะเวลาการเช่า</div>
              <p>
                สัญญาการเช่ามีกำหนดระยะเวลา ตั้งแต่วันที่ <strong>{{ currentDoc.start_date }}</strong> ถึงวันที่ <strong>{{ currentDoc.end_date }}</strong>
              </p>

              <div class="section-title">ข้อ ๓. ค่าเช่าและเงินประกัน</div>
              <div class="contract-grid" style="margin-top: 8px; background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <div><strong>อัตราค่าเช่า:</strong> ฿{{ Number(currentDoc.rental_fee).toLocaleString() }} ({{ currentDoc.billing_cycle === 'monthly' ? 'รายเดือน' : 'รายวัน' }})</div>
                <div><strong>เงินประกันสัญญา:</strong> ฿{{ Number(currentDoc.security_deposit || 0).toLocaleString() }} บาท</div>
                <div><strong>เงินจ่ายล่วงหน้า:</strong> ฿{{ Number(currentDoc.advance_payment || 0).toLocaleString() }} บาท</div>
                <div><strong>สถานะสัญญา:</strong> {{ getStatusLabel(currentDoc.status) }}</div>
              </div>

              <div class="section-title">ข้อ ๔. ข้อกำหนดและเงื่อนไขเพิ่มเติม</div>
              <p style="color: #475569;">
                {{ currentDoc.terms_and_conditions || 'ผู้เช่าต้องปฏิบัติตามกฎระเบียบความสะอาด สุขอนามัย และความปลอดภัยของตลาดอย่างเคร่งครัด' }}
              </p>

              <!-- Signature Area -->
              <div class="contract-sign-box">
                <div>
                  <div class="sign-line">
                    ลงชื่อ ...........................................................<br>
                    ( ผู้ให้เช่า / เจ้าหน้าที่ดูแลตลาด )
                  </div>
                </div>
                <div>
                  <div class="sign-line">
                    ลงชื่อ ...........................................................<br>
                    ( {{ currentDoc.tenant_name }} )<br>
                    ผู้เช่า
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { get, post, del } = useApi()
const { showSuccess, showError, showConfirm } = useAppAlert()

const loading = ref(true)
const saving = ref(false)
const contracts = ref<any[]>([])
const filteredContracts = ref<any[]>([])
const availableStalls = ref<any[]>([])

const selectedStatus = ref('')
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const countContractsByStatus = (st: string) => {
  return contracts.value.filter(c => c.status === st).length
}

const totalPages = computed(() => {
  return Math.ceil(filteredContracts.value.length / pageSize.value) || 1
})

const paginatedContracts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredContracts.value.slice(start, start + pageSize.value)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const total = totalPages.value
  const cur = currentPage.value

  let start = Math.max(1, cur - 2)
  let end = Math.min(total, cur + 2)

  if (end - start < 4) {
    if (start === 1) end = Math.min(total, start + 4)
    else if (end === total) start = Math.max(1, end - 4)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const exportReport = async () => {
  await showSuccess(`ส่งออกรายงานสัญญาเช่าพื้นที่ ${filteredContracts.value.length} ฉบับ เรียบร้อยแล้ว`, 'ส่งออกรายงาน')
}

// Create Modal
const showCreateModal = ref(false)
const formContract = ref({
  stall_id: '' as any,
  tenant_name: '',
  tenant_id_card: '',
  tenant_phone: '',
  tenant_email: '',
  tenant_address: '',
  business_name: '',
  business_type: '',
  start_date: new Date().toISOString().slice(0, 10),
  end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  billing_cycle: 'monthly',
  rental_fee: 4000,
  security_deposit: 8000,
  advance_payment: 4000,
  terms_and_conditions: 'ผู้เช่าต้องรักษาความสะอาดและชำระค่าเช่าภายในวันที่ 5 ของทุกเดือน',
  status: 'active'
})

// Document Preview Modal
const viewDocModal = ref(false)
const currentDoc = ref<any>(null)

const loadData = async () => {
  loading.value = true
  try {
    const [contractsRes, stallsRes, appsRes] = await Promise.all([
      get('/contracts'),
      get('/stalls'),
      get('/applications').catch(() => [])
    ])
    contracts.value = Array.isArray(contractsRes) ? contractsRes : (Array.isArray(contractsRes?.data) ? contractsRes.data : [])
    const rawStalls = Array.isArray(stallsRes) ? stallsRes : (Array.isArray(stallsRes?.data) ? stallsRes.data : [])
    const rawApps = Array.isArray(appsRes) ? appsRes : (Array.isArray(appsRes?.data) ? appsRes.data : [])
    availableStalls.value = rawStalls.filter((s: any) => s.status === 'available' || s.stall_status === 'available')
    filterContracts()

    // If query contains new_for_stall (from Approved Lease Application)
    if (route.query.new_for_stall) {
      const stallKey = String(route.query.new_for_stall).trim()
      const appId = route.query.app_id ? Number(route.query.app_id) : null
      const matchedApp = rawApps.find((a: any) =>
        (appId && Number(a.id) === appId) ||
        String(a.stall_number || a.stall_ident) === stallKey ||
        String(a.stall_id) === stallKey
      )
      let target = rawStalls.find((s: any) =>
        String(s.id) === stallKey ||
        String(s.stall_number || s.ident) === stallKey
      )
      if (!target && matchedApp) {
        target = {
          id: matchedApp.stall_id || matchedApp.stall_number,
          stall_number: matchedApp.stall_number || matchedApp.stall_ident,
          ident: matchedApp.stall_number || matchedApp.stall_ident,
          zone_id: 'A',
          monthly_rate: matchedApp.stall_monthly_rate || matchedApp.monthly_rate || 3600
        }
      }
      if (target) {
        if (!availableStalls.value.some((s: any) => String(s.id) === String(target.id))) {
          availableStalls.value = [target, ...availableStalls.value]
        }
        openCreateModal()
        formContract.value.stall_id = target.id
        const rate = matchedApp?.stall_monthly_rate || matchedApp?.monthly_rate || target.monthly_rate || target.monthly_rent || 3600
        formContract.value.rental_fee = rate
        formContract.value.security_deposit = rate * 2
        formContract.value.advance_payment = rate
        if (matchedApp) {
          formContract.value.tenant_name = matchedApp.applicant_name || matchedApp.tenant_name || ''
          formContract.value.tenant_id_card = matchedApp.applicant_id_card || ''
          formContract.value.tenant_phone = matchedApp.applicant_phone || matchedApp.tenant_phone || ''
          formContract.value.tenant_email = matchedApp.applicant_email || ''
          formContract.value.tenant_address = matchedApp.applicant_address || ''
          formContract.value.business_name = matchedApp.shop_name || ''
          formContract.value.business_type = matchedApp.product_type || matchedApp.product_category || ''
          if (matchedApp.requested_start_date) {
            formContract.value.start_date = matchedApp.requested_start_date
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed to load contracts:', err)
  } finally {
    loading.value = false
  }
}

const filterContracts = () => {
  let list = Array.isArray(contracts.value) ? [...contracts.value] : []
  if (selectedStatus.value) {
    list = list.filter(c => c.status === selectedStatus.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(c =>
      (c.contract_number && c.contract_number.toLowerCase().includes(q)) ||
      (c.tenant_name && c.tenant_name.toLowerCase().includes(q)) ||
      (c.business_name && c.business_name.toLowerCase().includes(q)) ||
      (c.shop_name && c.shop_name.toLowerCase().includes(q)) ||
      (c.tenant_phone && c.tenant_phone.includes(q))
    )
  }
  filteredContracts.value = list
}

const onStallSelected = () => {
  const stall = availableStalls.value.find(s => s.id === formContract.value.stall_id)
  if (stall) {
    const rate = stall.monthly_rate || stall.monthly_rent || 2000
    formContract.value.rental_fee = rate
    formContract.value.security_deposit = rate * 2
    formContract.value.advance_payment = rate
    formContract.value.business_type = stall.category || stall.zone_name || ''
  }
}

const openCreateModal = () => {
  formContract.value = {
    stall_id: availableStalls.value[0]?.id || '',
    tenant_name: '',
    tenant_id_card: '',
    tenant_phone: '',
    tenant_email: '',
    tenant_address: '',
    business_name: '',
    business_type: '',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    billing_cycle: 'monthly',
    rental_fee: 4000,
    security_deposit: 8000,
    advance_payment: 4000,
    terms_and_conditions: 'ผู้เช่าต้องรักษาความสะอาดและชำระค่าเช่าภายในวันที่ 5 ของทุกเดือน',
    status: 'active'
  }
  if (formContract.value.stall_id) {
    onStallSelected()
  }
  showCreateModal.value = true
}

const submitContract = async () => {
  saving.value = true
  try {
    const selectedStall = availableStalls.value.find(s => s.id === formContract.value.stall_id)
    const stallIdent = selectedStall?.ident || selectedStall?.stall_number || String(formContract.value.stall_id || '')
    const payload = {
      ...formContract.value,
      stall_ident: stallIdent,
      stall_number: stallIdent,
      shop_name: formContract.value.business_name || formContract.value.tenant_name || 'ร้านค้า',
      monthly_rental: Number(formContract.value.rental_fee) || 0
    }
    await post('/contracts', payload)
    showCreateModal.value = false
    await loadData()
    await showSuccess('บันทึกสัญญาเช่าและเปิดใช้งานแผงเช่าเรียบร้อยแล้ว', 'สร้างสัญญาสำเร็จ')
  } catch (err: any) {
    await showError(err?.data?.detail || err?.data?.error?.message || 'เกิดข้อผิดพลาดในการสร้างสัญญา', 'ข้อผิดพลาด')
  } finally {
    saving.value = false
  }
}

const terminateContract = async (contract: any) => {
  const confirmed = await showConfirm(
    `คุณต้องการสิ้นสุดสัญญา ${contract.contract_number} ก่อนกำหนดหรือไม่? ระบบจะเปลี่ยนสถานะแผงเป็น "ว่าง" โดยอัตโนมัติ`,
    {
      title: 'ยืนยันสิ้นสุดสัญญาก่อนกำหนด',
      type: 'error',
      icon: 'trash',
      confirmText: 'สิ้นสุดสัญญา',
      cancelText: 'ยกเลิก'
    }
  )
  if (confirmed) {
    try {
      await post(`/contracts/${contract.id}/terminate`)
      await loadData()
      await showSuccess('สัญญาเช่าถูกยกเลิกแล้ว และสถานะแผงถูกปรับเป็นว่างเรียบร้อย', 'สำเร็จ')
    } catch (err: any) {
      await showError(err?.data?.detail || 'เกิดข้อผิดพลาด', 'ข้อผิดพลาด')
    }
  }
}

const viewContractDoc = (c: any) => {
  currentDoc.value = c
  viewDocModal.value = true
}

const printDoc = () => {
  window.print()
}

const isExpiringSoon = (endDateStr: string) => {
  const end = new Date(endDateStr).getTime()
  const now = Date.now()
  const diffDays = (end - now) / (1000 * 3600 * 24)
  return diffDays > 0 && diffDays <= 30
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'active': return 'badge-soft-success'
    case 'pending': return 'badge-soft-blue'
    case 'expired': return 'badge-soft-gray'
    case 'terminated': return 'badge-soft-danger'
    default: return 'badge-soft-gray'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active': return 'ใช้งานอยู่'
    case 'pending': return 'รอดำเนินการ'
    case 'expired': return 'หมดสัญญา'
    case 'terminated': return 'ยกเลิกแล้ว'
    default: return status
  }
}

onMounted(() => {
  loadData()
})
</script>
